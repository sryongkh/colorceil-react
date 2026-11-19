// Ephemeral MongoDB for browser checks; never connects to the user's database.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../src/server/app.js";
import { seedPalettes } from "../src/server/seed.js";
const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri());
await seedPalettes();
const server = createApp({
  secret: "browser-tests-only-secret-with-at-least-32-characters",
  origin: "http://localhost:4300",
}).listen(3000, "127.0.0.1", () => console.log("Test API ready"));
const shutdown = () =>
  server.close(async () => {
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  });
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
