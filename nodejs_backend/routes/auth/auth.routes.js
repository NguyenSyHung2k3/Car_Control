const express = require("express");
const { register, login } = require("../../controllers/auth/auth.controller");
const { protect } = require("../../middlewares/auth/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;
