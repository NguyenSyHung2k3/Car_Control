const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // 7 days
  });
};

const generateAccessToken = (userId) => {

}

const generateRefreshToken = (userId) => {
  
}

const generateDeviceSessionToken = (userId, deviceId) => {
  return jwt.sign(
    { 
      userId, 
      deviceId 
    }, 
    process.env.DEVICE_SESSION_TOKEN, 
    { 
      expiresIn: "1h"
    }
  );
}

module.exports = { generateToken, generateDeviceSessionToken };