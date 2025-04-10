const User = require("../models/User");
const APIError = require("../Response/APIError");
const APIResponse = require("../Response/APISuccess");



const addUserController = async (req,res) => {
    const clerkId = req.body.clerkId;
    const email = req.body.email;
    
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
}

module.exports = addUserController;