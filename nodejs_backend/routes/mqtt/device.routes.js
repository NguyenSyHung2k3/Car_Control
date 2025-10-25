const express = require("express");
const router = express.Router();
const deviceController = require("../../controllers/mqtt/device.controller");

/**
 * Device Connection Routes
 * Following MQTT flow for IoT device connection
 */

// Connect to device endpoint
// POST /api/device/connect
// Body: { userId: string, deviceId: string }
router.post("/connect", deviceController.connectToDevice);

// Get device status endpoint
// GET /api/device/status/:userId/:deviceId
router.get("/status/:userId/:deviceId", deviceController.getDeviceStatus);

module.exports = router;