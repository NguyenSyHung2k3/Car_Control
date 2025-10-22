require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const mqttService = require("./config/mqtt");
const authRoutes = require("./routes/auth/auth.routes");
const deviceRoutes = require("./routes/mqtt/device.routes");
const testRoutes = require("./test/test.publish");
const testRoutes2 = require("./test/test.publish.2");

const app = express();
app.use(express.json());

// Connect to mongodb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Connect to HiveMqtt
mqttService.connect();

/*



*/

// Auth Routes
app.use("/api/auth", authRoutes);

// Test MQTT 
app.use("/test", testRoutes);
app.use("/test", testRoutes2);

// Device Routes
app.use("/api/device", deviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server run at http://localhost:${PORT}`));
