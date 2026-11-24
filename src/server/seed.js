import { readFile } from "node:fs/promises";
import Palette from "./models/Palette.js";

export async function seedPalettes() {
  const examples = JSON.parse(
    await readFile(new URL("../data/example-palettes.json", import.meta.url), "utf8"),
  );
  await Palette.bulkWrite(
    examples.map((palette, i) => ({
      updateOne: {
        filter: { seedKey: `example-${i}` },
        update: { $setOnInsert: { ...palette, seedKey: `example-${i}` } },
        upsert: true,
      },
    })),
  );
}
