const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

function resolveDataFile(fileName) {
  if (!/^[a-z0-9_.-]+$/i.test(fileName)) {
    throw new Error("Invalid data file name.");
  }

  return path.join(dataDir, fileName);
}

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJson(fileName, fallbackValue) {
  const filePath = resolveDataFile(fileName);

  try {
    const text = await fs.readFile(filePath, "utf8");
    if (!text.trim()) {
      return fallbackValue;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeJson(fileName, fallbackValue);
      return fallbackValue;
    }

    throw error;
  }
}

async function writeJson(fileName, value) {
  await ensureDataDir();

  const filePath = resolveDataFile(fileName);
  const tempPath = `${filePath}.${Date.now()}.tmp`;

  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

module.exports = {
  ensureDataDir,
  readJson,
  writeJson
};