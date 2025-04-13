const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true,
            trim: true
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
            default : null
        },
        preferGenres : {
            type: Array,
            required: false,
            default: []

        },
        age : {
            type: Number,
            required: false,
            default: null
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