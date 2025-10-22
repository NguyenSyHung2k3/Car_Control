const {
    publishConnectToDeviceService,
    publishLedOnToDeviceService,
    publishLedOffToDeviceService,
} = require("../../services/mqtt/device/device.service");

async function publishConnectToDevice(req, res) {
    const {
        userId,
        deviceId
    } = req.body;

    if(!userId || !deviceId) {
        return res.status(400).json({
            error: "UserId and DeviceId are required!"
        })
    }

    try {
        const result = await publishConnectToDeviceService(userId, deviceId);
        if (result === "OK") {
        return res.json({
            message: "Device connected successfully!",
            status: "Connected",
            deviceId,
            userId
        });
    }
    } catch (err) {
        return res.status(500).json({
            error: err.message || "Failed to connect to device"
        });
    }
} 

async function publishLedOnToDevice(req, res) {
    const {
        userId,
        deviceId
    } = req.body;

    if(!userId || !deviceId) {
        return res.status(400).json({
            error: "UserId and DeviceId are required!"
        })
    }

    try {
        const result = await publishLedOnToDeviceService(userId, deviceId, 5000);
        if (result === "Device LED_ON OK") {
        return res.json({
            message: "Turn LED on successfully!",
            status: "Successful",
            deviceId,
            userId
        });
    }
    } catch (err) {
        return res.status(500).json({
            error: err.message || "Failed to turn LED on"
        });
    }
}

async function publishLedOffToDevice(req, res) {
    const {
        userId,
        deviceId
    } = req.body;

    if(!userId || !deviceId) {
        return res.status(400).json({
            error: "UserId and DeviceId are required!"
        })
    }

    try {
        const result = await publishLedOffToDeviceService(userId, deviceId, 5000);
        if (result === "Device LED_OFF OK") {
        return res.json({
            message: "Turn LED off successfully!",
            status: "Successful",
            deviceId,
            userId
        });
    }
    } catch (err) {
        return res.status(500).json({
            error: err.message || "Failed to turn LED off"
        });
    }
}

module.exports = {
    publishConnectToDevice,
    publishLedOnToDevice,
    publishLedOffToDevice
}