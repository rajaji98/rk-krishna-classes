const bcrypt = require("bcryptjs");
const { ensureDataDir, readJson, writeJson } = require("./store");

async function ensureDataFiles() {
  await ensureDataDir();

  const students = await readJson("students.json", []);
  if (!Array.isArray(students)) {
    await writeJson("students.json", []);
  }

  const teachers = await readJson("teachers.json", []);
  if (!Array.isArray(teachers)) {
    await writeJson("teachers.json", []);
    return createDefaultTeacher();
  }

  if (teachers.length === 0) {
    return createDefaultTeacher();
  }

  return null;
}

async function createDefaultTeacher() {
  const username = process.env.DEFAULT_TEACHER_USERNAME || "teacher";
  const password = process.env.DEFAULT_TEACHER_PASSWORD || "ChangeMe@123";
  const passwordHash = await bcrypt.hash(password, 10);

  await writeJson("teachers.json", [
    {
      id: "teacher-1",
      username,
      passwordHash,
      createdAt: new Date().toISOString()
    }
  ]);

  console.log(`Teacher login created. Username: ${username}`);
}

module.exports = {
  ensureDataFiles
};