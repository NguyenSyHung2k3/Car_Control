const express = require("express");
const router = express.Router();
const mqttService = require("../config/mqtt");

// API test publish
router.post("/publish2", (req, res) => {
  const { topic, message } = req.body;

  if (!topic || !message) {
    return res.status(400).json({ error: "Missing topic or message" });
  }

  mqttService.publish(topic, message);
  res.json({ status: "ok", topic, message });
});

module.exports = router;
