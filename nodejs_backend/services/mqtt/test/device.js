const express = require("express");
const mqttService = require("../../../config/mqtt");
const User = require("../../../models/user.model");
const Device = require("../../../models/device.model");

// API test connect 

async function createDevice(deviceId) {
    const device = await Device.create({
        
    })
}

async function registerDevice(deviceId, userId) {
    const user = await User.findOne({userId});
    
    if(!user) {
        throw new Error("User not exist!");
    }

    const device = await Device.findOne({deviceId});
    if(!device) {
        createDevice(deviceId);
    }

    return {
        deviceId: device._id,
        name: device.name,
        owner: user,
        status: device.status,
        lastActive: device.lastActive,
        metadata: device.metadata,        
    }
}