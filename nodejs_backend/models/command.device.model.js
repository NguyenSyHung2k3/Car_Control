const mongoose = require("mongoose");

const commandSchema = new mongoose.Schema(
    {
        device: {},
        user: {},
        session: {},
        command: {},
        status: {},
    },
    {
        timestamps: true,
    }
)