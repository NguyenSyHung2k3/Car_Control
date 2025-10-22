const mqtt = require("mqtt")
const EventEmitter = require("events");
const { v4: uuidv4 } = require("uuid");

const options = {
  clientId: "mqtt_" + uuidv4(), 
  clean: true, 
  connectTimeout: 4000,
  username: process.env.MQTT_USER, 
  password: process.env.MQTT_PASSWORD, 
};

class MqttService extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.subscribedTopics = new Set();
  }

  connect() {
    if (this.client) return this.client;

    this.client = mqtt.connect(process.env.MQTT_BROKER_URL, options);

    this.client.on("connect", () => {
      console.log("MQTT connected");
    });

    this.client.on("message", (topic, message) => {
      const msg = message.toString();
      console.log(`[MQTT] ${topic}: ${msg}`);
      this.emit("message", topic, msg);
    });

    this.client.on("error", (err) => {
      console.error("MQTT error:", err);
    });

    return this.client;
  }

  subscribe(topic) {
    if (!this.client) {
      console.error("MQTT not connected");
      return;
    }
    this.client.subscribe(topic, () => {
      console.log(`Subscribed to ${topic}`);
      this.subscribedTopics.add(topic);
    });
  }

  publish(topic, msg) {
    if (!this.client) {
      console.error("MQTT not connected");
      return;
    }
    this.client.publish(topic, msg);
  }

  unsubscribe(topic) {
    if (!this.client) {
      console.error("MQTT not connected");
      return;
    }

    if (!this.subscribedTopics.has(topic)) {
      console.log(`[MQTT] Not subscribed to ${topic}`);
      return;
    }

    this.client.unsubscribe(topic, () => {
      console.log(`Unsubscribed from ${topic}`);
      this.subscribedTopics.delete(topic);
    });
  }
}

module.exports = new MqttService();