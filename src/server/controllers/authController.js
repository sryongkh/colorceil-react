import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

// Registration endpoint
router.post("/register", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 6);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    res.json(savedUser);
  } catch {
    res.status(500).send();
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      // Create and assign a token
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      res.header("auth-token", token).send(token);
    } else {
      res.send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = await bcrypt.hash(resetToken, 10);
  user.resetPasswordToken = hashedResetToken;
  await user.save();
  res.send("Password reset token sent");
});

export default router;
