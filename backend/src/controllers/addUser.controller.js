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

        const headerPayload = req.headers;
        const svix_id = headerPayload["svix-id"];
        const svix_signature = headerPayload["svix-signature"];
        const svix_timestamp = headerPayload["svix-timestamp"];

        if(!svix_id || !svix_signature || ! svix_timestamp){
            return res.status(400).json(new APIError(400,"SVIX-Headers required",[],null));

        }

        const payload = req.body;

        const body = JSON.stringify(payload);
        
        const wh = new Webhook(ADD_USER_WEBHOOK);

        let evt;
    
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-signature": svix_signature,
                "svix-timestamp": svix_timestamp
            }, {
                tolerance: 3600 // Add time tolerance to fix previous error
            })    
            if(!evt) {
                return res.status(400).json(new APIError(400, "Invalid request", [], "Invalid request"));
            }
            
            const clerkId = evt.data.id
            const email = evt.data.email_addresses[0].email_address;
            if(!clerkId || !email) {
                return res.status(400).json({
                    status: "error",
                    message: "clerkId and email are required"
                });
            }
    
            // Check if user exists by either clerkId OR email
            const existingUser = await User.findOne({ 
                $or: [
                    { clerkId: clerkId },
                    { email: email }
                ]
            });
            
            if(existingUser) {
                // User exists - check if it's the same clerkId
                if(existingUser.clerkId === clerkId) {
                    return res.status(400).json({
                        status: "error",
                        message: "User already exists"
                    });
                } else {
                    // Different clerkId but same email
                    return res.status(400).json({
                        status: "error",
                        message: "Email already in use by another user"
                    });
                }
            }
            
            const newUser = new User({
                clerkId: clerkId,
                email: email
            });
            
            if(!newUser){
                return res.status(400).json(new APIError(400, "User not created", [], "User not created"));
            }
            await newUser.save();
            console.log(newUser);
            
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