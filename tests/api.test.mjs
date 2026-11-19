import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { existsSync } from "node:fs";
import { createApp } from "../src/server/app.js";
import { seedPalettes } from "../src/server/seed.js";
import User from "../src/server/models/User.js";

let mongo, server, url;
const mail = [];
const origin = "http://localhost:4200";
const password = "Colorful-secret-123";
async function request(
  path,
  { method = "GET", body, cookie, requestOrigin = origin } = {},
) {
  return fetch(`${url}/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: requestOrigin,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
const cookieOf = (response) => response.headers.get("set-cookie").split(";")[0];
before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await User.init();
  await seedPalettes();
  await seedPalettes();
  const app = createApp({
    secret: "test-only-secret-that-is-at-least-32-characters",
    origin,
    sendResetEmail: async (to, link) => {
      mail.push({ to, link });
    },
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  url = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server?.close(resolve));
  await mongoose.disconnect();
  await mongo?.stop();
});

test("public palettes seed once and unknown APIs return JSON 404", async () => {
  const response = await request("/palettes");
  assert.equal(response.status, 200);
  assert.equal((await response.json()).palettes.length, 9);
  assert.equal((await request("/health")).status, 200);
  assert.equal((await request("/missing")).status, 404);
});
test("signup, login, ownership, persistence, delete, and sign out", async () => {
  assert.equal(
    (await request("/palettes", { method: "POST", body: {} })).status,
    401,
  );
  assert.equal(
    (
      await request("/auth/register", {
        method: "POST",
        body: { email: "bad", password },
      })
    ).status,
    400,
  );
  const registration = await request("/auth/register", {
    method: "POST",
    body: { email: "Test@Example.com ", password },
  });
  assert.equal(registration.status, 201);
  assert.match(registration.headers.get("set-cookie"), /HttpOnly/i);
  const registered = await registration.json();
  assert.equal(registered.user.email, "test@example.com");
  assert.equal(registered.user.password, undefined);
  const cookie = cookieOf(registration);
  assert.equal(
    (
      await request("/auth/register", {
        method: "POST",
        body: { email: "test@example.com", password },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { email: "test@example.com", password: "wrong-password" },
      })
    ).status,
    401,
  );
  const login = await request("/auth/login", {
    method: "POST",
    body: { email: "test@example.com", password },
  });
  assert.equal(login.status, 200);
  assert.equal((await request("/auth/me", { cookie })).status, 200);
  const palette = {
    name: "My custom palette",
    colors: ["#ffb443", "#000000", "#FFFFFF", "#AABBCC", "#123456"],
    tags: ["warm"],
  };
  assert.equal(
    (
      await request("/palettes", {
        method: "POST",
        body: { ...palette, colors: ["nope"] },
        cookie,
      })
    ).status,
    400,
  );
  const saved = await request("/palettes", {
    method: "POST",
    body: palette,
    cookie,
  });
  assert.equal(saved.status, 201);
  const { palette: item } = await saved.json();
  assert.equal(item.colors[0], "#FFB443");
  const mine = await (
    await request("/palettes/mine", { cookie: cookieOf(login) })
  ).json();
  assert.equal(mine.palettes[0]._id, item._id);
  const other = await request("/auth/register", {
    method: "POST",
    body: { email: "other@example.com", password },
  });
  assert.equal(
    (
      await request(`/palettes/${item._id}`, {
        method: "DELETE",
        cookie: cookieOf(other),
      })
    ).status,
    404,
  );
  assert.equal(
    (await request(`/palettes/${item._id}`, { method: "DELETE", cookie }))
      .status,
    204,
  );
  assert.equal(
    (await request(`/palettes/not-an-id`, { method: "DELETE", cookie })).status,
    400,
  );
  assert.equal(
    (await (await request("/palettes/mine", { cookie })).json()).palettes
      .length,
    0,
  );
  const logout = await request("/auth/logout", { method: "POST", cookie });
  assert.equal(logout.status, 204);
  assert.match(logout.headers.get("set-cookie"), /Expires=Thu, 01 Jan 1970/i);
});
test("reset uses email, single-use expiring tokens, and invalidates existing sessions", async () => {
  const login = await request("/auth/login", {
    method: "POST",
    body: { email: "test@example.com", password },
  });
  const cookie = cookieOf(login);
  const reset = await request("/auth/reset-password", {
    method: "POST",
    body: { email: "test@example.com" },
  });
  assert.equal(reset.status, 200);
  assert.equal(mail.length, 1);
  const token = new URL(mail[0].link).searchParams.get("token");
  const record = await User.findOne({ email: "test@example.com" }).select(
    "+resetPasswordToken",
  );
  assert.notEqual(record.resetPasswordToken, token);
  const newPassword = "Changed-secret-456";
  const confirm = await request("/auth/confirm-reset", {
    method: "POST",
    body: { token, password: newPassword },
  });
  assert.equal(confirm.status, 200);
  assert.equal(
    (
      await request("/auth/confirm-reset", {
        method: "POST",
        body: { token, password: newPassword },
      })
    ).status,
    400,
  );
  assert.equal((await request("/auth/me", { cookie })).status, 401);
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { email: "test@example.com", password },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { email: "test@example.com", password: newPassword },
      })
    ).status,
    200,
  );
  await request("/auth/reset-password", {
    method: "POST",
    body: { email: "test@example.com" },
  });
  const expiredToken = new URL(mail[1].link).searchParams.get("token");
  await User.updateOne(
    { email: "test@example.com" },
    { $set: { resetPasswordExpires: new Date(0) } },
  );
  assert.equal(
    (
      await request("/auth/confirm-reset", {
        method: "POST",
        body: { token: expiredToken, password: newPassword },
      })
    ).status,
    400,
  );
});
test("rejects cross-origin writes, operator injection, oversized passwords, and malformed JSON", async () => {
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        requestOrigin: "https://other.example",
        body: {},
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("/auth/login", {
        method: "POST",
        body: { email: { $ne: null }, password },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/auth/register", {
        method: "POST",
        body: { email: "long@example.com", password: "🎨".repeat(30) },
      })
    ).status,
    400,
  );
  const malformed = await fetch(`${url}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad",
  });
  assert.equal(malformed.status, 400);
});

test(
  "production build serves Angular deep links",
  { skip: !existsSync("dist/colorceil/browser/index.html") },
  async () => {
    const response = await fetch(`${url}/generate-palettes`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(await response.text(), /<app-root>/);
  },
);
