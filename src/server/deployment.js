import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { createApp } from "./app.js";
import { seedPalettes } from "./seed.js";

const examples = JSON.parse(
  await readFile(new URL("../data/example-palettes.json", import.meta.url), "utf8"),
);
const json = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(body));
};

export function createDeploymentHandler({ env = process.env } = {}) {
  let app;
  let connection;
  return async (req, res) => {
    const pathname = new URL(req.url, "https://colorceil.invalid").pathname;
    // Publish an honest read-only showcase before a database has been provisioned.
    if (!env.MONGODB_URI || !env.TOKEN_SECRET) {
      if (req.method === "GET" && pathname === "/api/palettes") {
        return json(res, 200, {
          demo: true,
          palettes: examples.map((p, i) => ({ ...p, _id: `example-${i}` })),
        });
      }
      if (req.method === "GET" && pathname === "/api/auth/me")
        return json(res, 401, { message: "Please sign in to continue." });
      return json(res, 503, {
        status: "setup_required",
        message:
          "Personal color collections are coming soon. Explore palettes and create your own color combinations in the meantime.",
      });
    }
    try {
      if (!app) {
        const origin =
          env.APP_ORIGIN ||
          `https://${env.VERCEL_ENV === "production" ? env.VERCEL_PROJECT_PRODUCTION_URL : env.VERCEL_URL}`;
        if (!/^https:\/\/[^/]+$/.test(origin))
          throw new Error("APP_ORIGIN must be a valid HTTPS origin.");
        const transport =
          env.SMTP_HOST && env.SMTP_FROM
            ? nodemailer.createTransport({
                host: env.SMTP_HOST,
                port: Number(env.SMTP_PORT || 587),
                secure: env.SMTP_PORT === "465",
                ...(env.SMTP_USER
                  ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } }
                  : {}),
              })
            : null;
        app = createApp({
          secret: env.TOKEN_SECRET,
          origin,
          production: true,
          sendResetEmail: transport
            ? (to, link) =>
                transport.sendMail({
                  from: env.SMTP_FROM,
                  to,
                  subject: "Reset your COLORceil password",
                  text: `Reset your password within 30 minutes: ${link}\nIf you did not request this, ignore this email.`,
                })
            : undefined,
        });
        app.set("trust proxy", 1);
      }
      // Reuse a connection within each warm function instance; retry after a failed connect.
      if (mongoose.connection.readyState !== 1) {
        connection ??= mongoose
          .connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 8000,
            maxPoolSize: 5,
          })
          .then(async () => {
            await Promise.all(
              Object.values(mongoose.models).map((model) => model.init()),
            );
            await seedPalettes();
          })
          .catch((error) => {
            connection = undefined;
            throw error;
          });
        await connection;
      }
      res.setHeader("Cache-Control", "no-store");
      return app(req, res);
    } catch (error) {
      console.error("Deployment API unavailable:", error.name);
      return json(res, 503, {
        message:
          "The service is temporarily unavailable. Please try again shortly.",
      });
    }
  };
}
