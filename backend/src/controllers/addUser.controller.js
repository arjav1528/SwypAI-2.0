const dotenv = require('dotenv')
const User = require("../models/User");
const APIError = require("../Response/APIError");
const APIResponse = require("../Response/APISuccess");
const { Webhook } = require('svix');
dotenv.config()





const addUserController = async (req,res) => {
    try {
        const ADD_USER_WEBHOOK = process.env.ADD_USER_WEBHOOK;
        if(!ADD_USER_WEBHOOK){
            throw new Error('Please add webhook secret in env file')
        }
    
        const headers = req.headers;
        const svix_id = headers['svix-id'];
        const svix_signature = headers['svix-signature'];
        const svix_timestamp = headers['svix-timestamp'];
    
        if(!svix_id || !svix_signature || !svix_timestamp){
            return res.status(400).json(new APIError(400, "Invalid request", [], "Invalid request"));
        }
    
        const wh = new Webhook(ADD_USER_WEBHOOK);
    
        let evt;
    
        try {
            evt = wh.verify(
                req.body,
                req.headers
            );
    
            if(!evt){
                return res.status(400).json(new APIError(400, "Invalid request", [], "Invalid request"));
            }
            
            const clerkId = evt.data.id;
            const email = evt.data.email_addresses[0].email_address;
            if(!clerkId || !email) {
                return res.status(400).json({
                    status: "error",
                    message: "clerkId and email are required"
                });
            }
    
            const user = await User.findOne({ clerkId: clerkId });
            if(user) {
                return res.status(400).json({
                    status: "error",
                    message: "User already exists"
                });
            }
            const newUser = new User({
                clerkId: clerkId,
                email: email
            });
            
            if(!newUser){
                return res.status(400).json(new APIError(400, "User not created", [], "User not created"));
            }
            await newUser.save();
            
            return res.status(200).json(new APIResponse(200, newUser, "User created successfully"));
    
            
        } catch (error) {
            console.error("Error verifying webhook:", error);
            return res.status(400).json(new APIError(400, "Invalid request", [], "Invalid request"));
            
        }
    } catch (error) {
        console.log("Error in addUserController:", error);
        return res.status(500).json(new APIError(500, "Internal server error", [], "Internal server error"));
        
    }

    
    
}

module.exports = addUserController;