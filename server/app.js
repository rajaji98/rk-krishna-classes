require("dotenv").config();

console.log("MONGO URI:", process.env.MONGODB_URI);

const path = require("path");
const express = require("express");

const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");


const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const teacherRoutes = require("./routes/teachers");

const admissionRoutes =
  require("./routes/admissions");

const { ensureDataFiles } = require("./utils/bootstrap");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(
  "/uploads",
  express.static(
    "server/uploads"
  )
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "RK Krishna Classes"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admissions", admissionRoutes );

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server." });
});

async function startServer() {

  await connectDB();

  await ensureDataFiles();

  app.listen(port, () => {

    console.log(
      `RK Krishna Classes is running at http://localhost:${port}`
    );

  });

}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});