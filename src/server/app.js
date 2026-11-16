import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import path from "node:path";
import { existsSync } from "node:fs";
import User from "./models/User.js";
import Palette from "./models/Palette.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordValid = (value) =>
  typeof value === "string" &&
  value.length >= 8 &&
  Buffer.byteLength(value, "utf8") <= 72;
const emailValue = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";
const publicUser = (user) => ({ id: user._id.toString(), email: user.email });
const digest = (token) => createHash("sha256").update(token).digest("hex");

export function createApp({
  secret,
  origin = "http://localhost:4200",
  production = false,
  sendResetEmail,
} = {}) {
  if (!secret || secret.length < 32)
    throw new Error("TOKEN_SECRET must contain at least 32 characters.");
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    next();
  });
  app.use(express.json({ limit: "16kb" }), cookieParser());
  // State-changing requests must come from the configured UI, including behind the dev proxy.
  app.use("/api", (req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.get("origin") &&
      req.get("origin") !== origin
    ) {
      return res
        .status(403)
        .json({ message: "Request origin is not allowed." });
    }
    next();
  });
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: production,
    path: "/",
    maxAge: 7 * 86400_000,
  };
  const setSession = (res, user) =>
    res.cookie(
      "colorceil_session",
      jwt.sign(
        { sub: user._id.toString(), version: user.sessionVersion },
        secret,
        { expiresIn: "7d", algorithm: "HS256" },
      ),
      cookieOptions,
    );
  const requireUser = async (req, res, next) => {
    let payload;
    try {
      payload = jwt.verify(req.cookies.colorceil_session ?? "", secret, {
        algorithms: ["HS256"],
      });
    } catch {
      return res.status(401).json({ message: "Please sign in to continue." });
    }
    if (typeof payload !== "object" || !mongoose.isValidObjectId(payload.sub))
      return res.status(401).json({ message: "Please sign in again." });
    const user = await User.findById(payload.sub);
    if (!user || user.sessionVersion !== payload.version)
      return res.status(401).json({ message: "Please sign in again." });
    req.user = user;
    next();
  };
  app.get("/api/health", (_req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({
        status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
      }),
  );
  const authLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in 15 minutes." },
  });
  app.use("/api/auth", authLimiter);
  app.post("/api/auth/register", async (req, res) => {
    const email = emailValue(req.body.email);
    if (
      !emailPattern.test(email) ||
      email.length > 254 ||
      !passwordValid(req.body.password)
    )
      return res
        .status(400)
        .json({
          message:
            "Enter a valid email and a password of at least 8 characters (maximum 72 UTF-8 bytes).",
        });
    const user = await User.create({
      email,
      password: await bcrypt.hash(req.body.password, 12),
    });
    setSession(res, user);
    res.status(201).json({ user: publicUser(user) });
  });
  app.post("/api/auth/login", async (req, res) => {
    const email = emailValue(req.body.email);
    if (
      !emailPattern.test(email) ||
      typeof req.body.password !== "string" ||
      !req.body.password.length ||
      Buffer.byteLength(req.body.password, "utf8") > 72
    )
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password, user.password)))
      return res
        .status(401)
        .json({ message: "Email or password is incorrect." });
    setSession(res, user);
    res.json({ user: publicUser(user) });
  });
  app.get("/api/auth/me", requireUser, (req, res) =>
    res.json({ user: publicUser(req.user) }),
  );
  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("colorceil_session", {
      ...cookieOptions,
      maxAge: undefined,
    });
    res.sendStatus(204);
  });
  app.post("/api/auth/reset-password", async (req, res) => {
    const email = emailValue(req.body.email);
    if (!emailPattern.test(email))
      return res.status(400).json({ message: "Enter a valid email address." });
    if (!sendResetEmail)
      return res
        .status(503)
        .json({
          message:
            "Password reset email is not configured yet. Please contact the site owner.",
        });
    const user = await User.findOne({ email });
    if (user) {
      const token = randomBytes(32).toString("hex");
      user.resetPasswordToken = digest(token);
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60_000);
      await user.save();
      await sendResetEmail(email, `${origin}/reset-password?token=${token}`);
    }
    res.json({
      message:
        "If an account exists for that email, a reset link has been sent.",
    });
  });
  app.post("/api/auth/confirm-reset", async (req, res) => {
    const { token, password } = req.body;
    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/.test(token) ||
      !passwordValid(password)
    )
      return res
        .status(400)
        .json({
          message:
            "Use a valid reset link and a password of at least 8 characters (maximum 72 UTF-8 bytes).",
        });
    const tokenHash = digest(token);
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken");
    if (
      !user ||
      !timingSafeEqual(
        Buffer.from(user.resetPasswordToken),
        Buffer.from(tokenHash),
      )
    )
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired." });
    // Atomic consume: a reset link cannot be used concurrently more than once.
    const updated = await User.findOneAndUpdate(
      {
        _id: user._id,
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      },
      {
        $set: { password: await bcrypt.hash(password, 12) },
        $inc: { sessionVersion: 1 },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      },
    );
    if (!updated)
      return res
        .status(400)
        .json({ message: "This reset link has already been used." });
    res.clearCookie("colorceil_session", {
      ...cookieOptions,
      maxAge: undefined,
    });
    res.json({ message: "Password updated. Sign in with your new password." });
  });
  app.get("/api/palettes", async (_req, res) =>
    res.json({
      palettes: await Palette.find()
        .sort({ createdAt: -1, _id: -1 })
        .limit(200)
        .select("-owner -seedKey -__v")
        .lean(),
    }),
  );
  app.get("/api/palettes/mine", requireUser, async (req, res) =>
    res.json({
      palettes: await Palette.find({ owner: req.user._id })
        .sort({ createdAt: -1, _id: -1 })
        .select("-owner -__v")
        .lean(),
    }),
  );
  app.post("/api/palettes", requireUser, async (req, res) => {
    const { name, colors, tags = [] } = req.body;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 80 ||
      !Array.isArray(colors) ||
      colors.length !== 5 ||
      !colors.every(
        (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
      ) ||
      !Array.isArray(tags) ||
      tags.length > 8 ||
      !tags.every((tag) => typeof tag === "string" && tag.length <= 24)
    ) {
      return res
        .status(400)
        .json({
          message:
            "Add a name (1–80 characters), five HEX colors, and up to eight short tags.",
        });
    }
    const palette = await Palette.create({
      name: name.trim(),
      colors: colors.map((c) => c.toUpperCase()),
      tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      owner: req.user._id,
    });
    res
      .status(201)
      .json({
        palette: {
          _id: palette._id,
          name: palette.name,
          colors: palette.colors,
          tags: palette.tags,
          createdAt: palette.createdAt,
        },
      });
  });
  app.delete("/api/palettes/:id", requireUser, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid palette ID." });
    const deleted = await Palette.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!deleted)
      return res.status(404).json({ message: "Palette not found." });
    res.sendStatus(204);
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "API endpoint not found." }),
  );
  const client = path.resolve("dist/colorceil/browser");
  if (existsSync(client)) {
    app.use(express.static(client));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(path.join(client, "index.html")),
    );
  }
  app.use((err, _req, res, _next) => {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    if (err instanceof SyntaxError && err.status === 400)
      return res.status(400).json({ message: "Invalid JSON request." });
    if (err.type === "entity.too.large")
      return res.status(413).json({ message: "Request is too large." });
    console.error("API error:", err.name);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  });
  return app;
}
