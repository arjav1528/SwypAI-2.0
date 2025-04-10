const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
        },
        email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        gender : {
            type: String,
            required: false,
        },
        preferGenres : {
            type: Array,
            required: false,
            default: []

        },
        age : {
            type: Number,
            required: false,
        },
        savedQuotes : {
            type: Array,
            required: false,
            default: []
        }
    },
    {
        timestamps: true,
    }
)

const User = mongoose.model('User', userSchema);
module.exports = User;