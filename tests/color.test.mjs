import test from "node:test";
import assert from "node:assert/strict";
import {
  clampChannel,
  rgbToHex,
  hexToRgb,
  readableInk,
} from "../src/app/core/color.ts";

test("RGB values clamp and round before converting to HEX", () => {
  assert.equal(rgbToHex([-1, 127.6, 400]), "#0080FF");
  assert.equal(clampChannel(NaN), 0);
  assert.equal(rgbToHex([255, 180, 67]), "#FFB443");
});
test("HEX input validates without silently accepting incomplete values", () => {
  assert.deepEqual(hexToRgb("#ffb443"), [255, 180, 67]);
  for (const invalid of ["#fff", "FFB443", "#XYZ123", "#1234567"])
    assert.equal(hexToRgb(invalid), null);
});
test("labels use contrasting ink on both light and dark swatches", () => {
  assert.equal(readableInk("#FFFFFF"), "#111111");
  assert.equal(readableInk("#000000"), "#FFFFFF");
});
