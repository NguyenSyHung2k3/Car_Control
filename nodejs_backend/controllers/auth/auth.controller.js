const { registerUser, loginUser } = require("../../services/auth/auth.service");

async function register (req, res) {
  try {
    const { email, password } = req.body;
    const result = await registerUser(email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

async function login (req, res) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({
      message: err.message,
    });
  }
};

module.exports = {
  register,
  login
}
