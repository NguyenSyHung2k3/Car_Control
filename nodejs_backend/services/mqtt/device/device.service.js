const Device = require("../../../models/device.model");
const User = require("../../../models/user.model");
const Session = require("../../../models/session.device.model");
const mqttService = require("../../../config/mqtt");

function handleDeviceStatus(userId, deviceId, startPublishing) {
  return function (topic, message) {
    if (topic !== `iot/${deviceId}/status`) return;

    let data;
    try {
      data = JSON.parse(message);
    } catch {
      console.error("Invalid JSON from device:", message);
      return;
    }

    console.log("[STEP1] Device responded:", data);

    mqttService.subscribe(`iot/${userId}/${deviceId}/status`);
    startPublishing();
  };
}

function handleUserDeviceStatus(userId, deviceId, stopPublishing, resolve, reject) {
  return async function (topic, message) {
    if (topic !== `iot/${userId}/${deviceId}/status`) return;

    let resp;
    try {
      resp = JSON.parse(message);
    } catch {
      console.error("Invalid JSON from device:", message);
      return;
    }

    if (resp.status === "OK") {
      console.log("[STEP3] Device accepted");

      try {
        let device = await Device.findOne({ deviceId });

        if (!device) {
          device = new Device({
            deviceId,
            owner: userId,
            status: "Connected",
          });
          await device.save();
        } else {
          device.owner = userId;
          device.status = "Connected";
          await device.save();
        }

        stopPublishing();
        resolve("OK");
      } catch (err) {
        console.error("[DB ERROR]", err.message);
        stopPublishing();
        reject(err);
      }
    } else {
      console.error("Device rejected");
      stopPublishing();
      reject(new Error("Rejected"));
    }
  };
}

async function publishConnectToDeviceService(userId, deviceId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    mqttService.subscribe(`iot/${deviceId}/status`);

    let intervalId = null;
    let timeoutId = null;

    const stopPublishing = () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);

      mqttService.removeAllListeners("message");
      mqttService.unsubscribe(`iot/${deviceId}/status`);
      mqttService.unsubscribe(`iot/${userId}/${deviceId}/status`);

      console.log("[CLEANUP] Stopped publishing and unsubscribed listeners");
    };

    const deviceStatusHandler = handleDeviceStatus(userId, deviceId, () => {
      intervalId = setInterval(() => {
        const payload = JSON.stringify({ userId, deviceId, message: "Connected" });
        mqttService.publish(`iot/${deviceId}/connected`, payload);
        console.log(`[STEP2] Published: ${payload}`);
      }, 1000);

      mqttService.on("message", userDeviceHandler);
    });

    const userDeviceHandler = handleUserDeviceStatus(
      userId,
      deviceId,
      stopPublishing,
      resolve,
      reject
    );

    mqttService.on("message", deviceStatusHandler);

    // Timeout
    timeoutId = setTimeout(() => {
      console.error("Timeout waiting for device status");
      stopPublishing();
      reject(new Error("Timeout"));
    }, timeout);
  });
}

function createCommandHandler(userId, deviceId, command, resolve, reject, stopPublishing) {
  return async function (topic, message) {
    if (topic !== `iot/${userId}/${deviceId}/response`) return;

    let resp;
    try {
      resp = JSON.parse(message);
    } catch {
      console.error("Invalid JSON from device:", message);
      return;
    }

    if (resp.status === "OK") {
      console.log(`[STEP3] Device confirmed ${command}`);

      const device = Device.findById(deviceId);
      const user = User.findById(userId);

      // const session = new Session({
      //   device: device,
      //   user: user,
      //   command: command,
      //   status: resp.status,
      // })

      // await session.save();

      stopPublishing();
      resolve(`Device ${command} OK`);
    } else {
      console.error(`[ERROR] Device failed to ${command}`);
      stopPublishing();
      reject(new Error(`Device failed to ${command}`));
    }
  };
}

async function sendDeviceCommand(userId, deviceId, command, timeout = 5000) {
  return new Promise((resolve, reject) => {
    mqttService.subscribe(`iot/${userId}/${deviceId}/response`);

    let intervalId = null;
    let timeoutId = null;

    const stopPublishing = () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);

      mqttService.removeAllListeners("message");
      mqttService.unsubscribe(`iot/${userId}/${deviceId}/response`);
      console.log("[CLEANUP] Stopped publishing and unsubscribed listeners");
    };

    const handler = createCommandHandler(userId, deviceId, command, resolve, reject, stopPublishing);

    mqttService.on("message", handler);

    // 
    intervalId = setInterval(() => {
      const payload = JSON.stringify({ userId, deviceId, command });
      mqttService.publish(`iot/${userId}/${deviceId}/command`, payload);
      console.log(`[STEP2] Sent command: ${payload}`);
    }, 1000);

    // Timeout
    timeoutId = setTimeout(() => {
      console.error(`Timeout waiting for ${command} response`);
      stopPublishing();
      reject(new Error(`Timeout waiting for ${command}`));
    }, timeout);
  });
}

async function publishLedOnToDeviceService(userId, deviceId, timeout = 5000) {
  return sendDeviceCommand(userId, deviceId, "LED_ON", timeout);
}

async function publishLedOffToDeviceService(userId, deviceId, timeout = 5000) {
  return sendDeviceCommand(userId, deviceId, "LED_OFF", timeout);
}

module.exports = { 
  publishConnectToDeviceService,
  publishLedOnToDeviceService,
  publishLedOffToDeviceService
};
