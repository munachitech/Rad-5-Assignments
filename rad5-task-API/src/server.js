import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json()); // lets us read JSON from req.body

app.get("/", (req, res) => {
  res.json({ message: "Rad5 Task API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reminders", reminderRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
