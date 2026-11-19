import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createDeploymentHandler } from "../src/server/deployment.js";

test("deployment works as a read-only showcase without credentials and never fakes saves", async () => {
  const server = createServer(createDeploymentHandler({ env: {} }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(`${url}/api/palettes`);
    assert.equal(response.status, 200);
    const library = await response.json();
    assert.equal(library.demo, true);
    assert.equal(library.palettes.length, 9);
    assert.equal((await fetch(`${url}/api/auth/me`)).status, 401);
    const save = await fetch(`${url}/api/palettes`, {
      method: "POST",
      body: "{}",
    });
    assert.equal(save.status, 503);
    assert.match((await save.json()).message, /preview mode/);
    assert.equal((await fetch(`${url}/api/health`)).status, 503);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
