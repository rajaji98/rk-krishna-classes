require("dotenv").config();

const bcrypt = require("bcryptjs");
const { writeJson, ensureDataDir } = require("../utils/store");

async function main() {
  const username = process.env.DEFAULT_TEACHER_USERNAME || "teacher";
  const password = process.env.DEFAULT_TEACHER_PASSWORD;

  if (!password) {
    throw new Error("Set DEFAULT_TEACHER_PASSWORD in your .env file first.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await ensureDataDir();
  await writeJson("teachers.json", [
    {
      id: "teacher-1",
      username,
      passwordHash,
      createdAt: new Date().toISOString()
    }
  ]);

  console.log(`Teacher login reset. Username: ${username}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});