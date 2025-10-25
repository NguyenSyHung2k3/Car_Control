const deviceService = require("../../services/mqtt/device/device.service");

/**
 * Connect to IoT device following MQTT flow
 * 1. Device publishes status to "iot/{deviceId}/status"
 * 2. Server subscribes and responds to "iot/{deviceId}/connected"
 * 3. Device confirms to "iot/{userId}/{deviceId}/status"
 * 4. Server subscribes to command topics
 */
async function connectToDevice(req, res) {
    const { userId, deviceId } = req.body;

    // Validate required fields
    if (!userId || !deviceId) {
        return res.status(400).json({
            success: false,
            error: "UserId and DeviceId are required!"
        });
    }

    try {
        console.log(`[CONNECT] Attempting to connect device ${deviceId} for user ${userId}`);
        
        const result = await deviceService.connectToDevice(userId, deviceId);
        
        if (result === "OK") {
            return res.json({
                success: true,
                message: "Device connected successfully!",
                data: {
                    deviceId,
                    userId,
                    status: "Connected",
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            return res.status(500).json({
                success: false,
                error: "Connection failed - unknown response"
            });
        }
    } catch (err) {
        console.error(`[CONNECT ERROR] ${err.message}`);
        return res.status(500).json({
            success: false,
            error: err.message || "Failed to connect to device"
        });
    }
}

/**
 * Get device connection status
 */
async function getDeviceStatus(req, res) {
    const { userId, deviceId } = req.params;

    if (!userId || !deviceId) {
        return res.status(400).json({
            success: false,
            error: "UserId and DeviceId are required!"
        });
    }

    try {
        const status = await deviceService.getDeviceStatus(userId, deviceId);
        
        return res.json({
            success: true,
            data: {
                deviceId,
                userId,
                status: status || "Unknown",
                lastChecked: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error(`[STATUS ERROR] ${err.message}`);
        return res.status(500).json({
            success: false,
            error: err.message || "Failed to get device status"
        });
    }
}

module.exports = {
    connectToDevice,
    getDeviceStatus
};