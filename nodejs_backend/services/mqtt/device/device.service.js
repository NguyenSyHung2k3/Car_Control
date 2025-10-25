const Device = require("../../../models/device.model");
const User = require("../../../models/user.model");
const mqttService = require("../../../config/mqtt");

/**
 * Connect to device following MQTT flow
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID
 * @param {number} timeout - Connection timeout in milliseconds
 * @returns {Promise<string>} - "OK" on success
 */
async function connectToDevice(userId, deviceId, timeout = 10000) {
    return new Promise((resolve, reject) => {
        console.log(`[MQTT SERVICE] Starting connection process for device ${deviceId}`);
        
        // Subscribe to device status topic
        mqttService.subscribe(`iot/${deviceId}/status`);
        
        let intervalId = null;
        let timeoutId = null;
        let isConnected = false;

        const cleanup = () => {
            if (intervalId) clearInterval(intervalId);
            if (timeoutId) clearTimeout(timeoutId);
            mqttService.removeAllListeners("message");
            mqttService.unsubscribe(`iot/${deviceId}/status`);
            mqttService.unsubscribe(`iot/${userId}/${deviceId}/status`);
            console.log("[MQTT SERVICE] Cleanup completed");
        };

        const stopPublishing = () => {
            cleanup();
            if (!isConnected) {
                reject(new Error("Connection timeout"));
            }
        };

        // Unified message handler for both device status and user-device status
        const messageHandler = async (topic, message) => {
            // Handle device status response
            if (topic === `iot/${deviceId}/status`) {
                let data;
                try {
                    data = JSON.parse(message);
                } catch (err) {
                    console.error("[MQTT SERVICE] Invalid JSON from device:", message);
                    return;
                }

                console.log(`[MQTT SERVICE] Device ${deviceId} responded with status:`, data);

                if (data.status === "Connected") {
                    // Subscribe to user-device status topic
                    mqttService.subscribe(`iot/${userId}/${deviceId}/status`);
                    console.log(`[MQTT SERVICE] Subscribed to iot/${userId}/${deviceId}/status`);
                    
                    // Start publishing connection confirmation
                    intervalId = setInterval(() => {
                        const payload = JSON.stringify({ 
                            userId, 
                            deviceId, 
                            msg: "Connected" 
                        });
                        mqttService.publish(`iot/${deviceId}/connected`, payload);
                        console.log(`[MQTT SERVICE] Published connection confirmation: ${payload}`);
                    }, 1000);
                }
            }
            
            // Handle user-device status confirmation
            else if (topic === `iot/${userId}/${deviceId}/status`) {
                let response;
                try {
                    response = JSON.parse(message);
                } catch (err) {
                    console.error("[MQTT SERVICE] Invalid JSON from device:", message);
                    return;
                }

                console.log(`[MQTT SERVICE] Device ${deviceId} confirmed connection for user ${userId}:`, response);

                if (response.status === "OK") {
                    try {
                        // Update or create device record in database
                        let device = await Device.findOne({ deviceId });
                        
                        if (!device) {
                            device = new Device({
                                deviceId,
                                owner: userId,
                                status: "Connected",
                                lastConnected: new Date()
                            });
                            console.log(`[MQTT SERVICE] Created new device record for ${deviceId}`);
                        } else {
                            device.owner = userId;
                            device.status = "Connected";
                            device.lastConnected = new Date();
                            console.log(`[MQTT SERVICE] Updated existing device record for ${deviceId}`);
                        }
                        
                        await device.save();
                        isConnected = true;
                        cleanup();
                        resolve("OK");
                        
                    } catch (dbError) {
                        console.error("[MQTT SERVICE] Database error:", dbError.message);
                        cleanup();
                        reject(new Error(`Database error: ${dbError.message}`));
                    }
                } else {
                    console.error(`[MQTT SERVICE] Device ${deviceId} rejected connection`);
                    cleanup();
                    reject(new Error("Device rejected connection"));
                }
            }
        };

        // Set up message handler
        mqttService.on("message", messageHandler);

        // Set timeout
        timeoutId = setTimeout(() => {
            console.error(`[MQTT SERVICE] Connection timeout for device ${deviceId}`);
            cleanup();
            reject(new Error("Connection timeout"));
        }, timeout);
    });
}

/**
 * Get device status from database
 * @param {string} userId - User ID
 * @param {string} deviceId - Device ID
 * @returns {Promise<string>} - Device status
 */
async function getDeviceStatus(userId, deviceId) {
    try {
        const device = await Device.findOne({ deviceId, owner: userId });
        
        if (!device) {
            return "Not Found";
        }
        
        return device.status || "Unknown";
    } catch (err) {
        console.error("[MQTT SERVICE] Error getting device status:", err.message);
        throw new Error("Failed to get device status");
    }
}

module.exports = {
    connectToDevice,
    getDeviceStatus
};