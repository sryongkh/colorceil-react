import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { createApp } from "./app.js";
import { seedPalettes } from "./seed.js";

const {
  MONGODB_URI,
  TOKEN_SECRET,
  APP_ORIGIN = "http://localhost:4200",
  PORT = "3000",
  NODE_ENV,
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env;
if (!MONGODB_URI || !TOKEN_SECRET) {
  console.error("Set MONGODB_URI and TOKEN_SECRET in .env. See .env.example.");
  process.exit(1);
}
const transport =
  SMTP_HOST && SMTP_FROM
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        ...(SMTP_USER
          ? { auth: { user: SMTP_USER, pass: SMTP_PASSWORD } }
          : {}),
      })
    : null;
const app = createApp({
  secret: TOKEN_SECRET,
  origin: APP_ORIGIN,
  production: NODE_ENV === "production",
  sendResetEmail: transport
    ? (to, link) =>
        transport.sendMail({
          from: SMTP_FROM,
          to,
          subject: "Reset your COLORceil password",
          text: `Reset your password within 30 minutes: ${link}\nIf you did not request this, ignore this email.`,
        })
    : undefined,
});
try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  await seedPalettes();
  const server = app.listen(Number(PORT), () =>
    console.log(`COLORceil API listening on port ${PORT}`),
  );
  const shutdown = () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("Unable to start API:", error.name);
  await mongoose.disconnect();
  process.exit(1);
}
