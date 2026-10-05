import express from "express";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/products", productRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "CRUD API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});