const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        device: {
            type: mongoose.Schema.Types.ObjectId, ref: "Device", 
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId, ref: "User",
            required: true,
        },
        command: {
            type: String,
            required: true,
        },
        status: {
            type: String, 
            enum: [
                "FAIL", 
                "OK", 
            ], 
            default: "FAIL",
        },
        startedAt: { 
            type: Date, 
            default: Date.now 
        },
        expiredAt: { 
            type: Date 
        },
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model("Session", sessionSchema);