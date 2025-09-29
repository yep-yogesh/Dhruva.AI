// persistStore.js
import fs from "fs";
import path from "path";

export async function loadStore(storePath) {
  if (!fs.existsSync(storePath)) return null;
  try {
    const raw = await fs.promises.readFile(storePath, "utf8");
    const obj = JSON.parse(raw);
    return obj;
  } catch (err) {
    console.error("Failed to load store:", err);
    return null;
  }
}

export async function saveStoreAtomic(storePath, obj) {
  const dir = path.dirname(storePath);
  await fs.promises.mkdir(dir, { recursive: true });
  const tmp = storePath + ".tmp";
  await fs.promises.writeFile(tmp, JSON.stringify(obj), "utf8");
  await fs.promises.rename(tmp, storePath);
}
