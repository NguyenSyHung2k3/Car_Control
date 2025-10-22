const User = require("../../models/user.model");
const { hashPassword, comparePassword } = require("../../utils/password");
const generateToken = require("../../utils/generateToken");

async function registerUser(email, password) {
  const userId = await User.findOne({ email });
  if (userId) {
    throw new Error("Email already exists");
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    email,
    password: hashed, 
  });

  return {
    _id: user._id,
    email: user.email,
    token: generateToken(user._id),
  };
}

async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return {
    _id: user._id,
    email: user.email,
    token: generateToken(user._id),
  };
}

module.exports = {
  registerUser,
  loginUser,
};
