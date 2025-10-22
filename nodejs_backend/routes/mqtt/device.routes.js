const express = require("express");
const router = express.Router();
const deviceController = require("../../controllers/mqtt/device.controller");

router.post("/connect", deviceController.publishConnectToDevice);
router.post("/control/LED_ON", deviceController.publishLedOnToDevice);
router.post("/control/LED_OFF", deviceController.publishLedOffToDevice);
module.exports = router;