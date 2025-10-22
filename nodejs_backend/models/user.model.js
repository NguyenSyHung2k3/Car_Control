const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: false,
        },
        password: {
            type: String,
            required: true,
            minLength: 6
        }      
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("User", userSchema);
