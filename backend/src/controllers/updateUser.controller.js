const User = require("../models/User");
const APIError = require("../Response/APIError");
const APIResponse = require("../Response/APISuccess");


const updateUserController = async (req, res) => {
    try {
        const clerkId = req.body.clerkId;
        const email = req.body.email;
        const gender = req.body.gender;
        const preferGenres = req.body.preferGenres;
        const age = req.body.age;
        const savedQuotes = req.body.savedQuotes;
        console.log("Request body:", req.body);
    
        if (!clerkId) {
            return res.status(400).json(new APIError(400, "Clerk ID is required", [], "Clerk ID is required"));
        }

        console.log("reached here");
    
        const user = await User.findOne({ clerkId: clerkId });
        if (!user) {
            return res.status(404).json(new APIError(404, "User not found", [], "User not found"));
        }
    
        if(email) {
            user.email = email;
        }

        if(gender) {
            user.gender = gender;
        }

        if(preferGenres) {
            user.preferGenres = preferGenres;
        }

        if(age) {
            user.age = age;
        }

        if(savedQuotes) {
            user.savedQuotes = savedQuotes;
        }


        console.log("Updated user information:", user);
    
        await user.save();
        return res.status(200).json(new APIResponse(200, user, "User updated successfully"));
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json(new APIError(500, "Internal server error", [], "Internal server error"));
        
    }
}

module.exports = updateUserController;