const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
    {
        // Use MAC Address for unique
        deviceId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            default: "Unnamed Device"
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId, ref: "User", 
            default: "Unknown",
            required: false
        },
        status: {
            type: String,
            enum: [
                "Connected",
                "Disconnected",
                "Error"
            ], 
            default: "Disconnected"
        },
        lastActive: {
            type: Date,
        },
        metadata: {
            firmware: String,
            model: String,
            location: String,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Device", deviceSchema);