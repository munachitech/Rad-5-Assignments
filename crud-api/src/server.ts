import express from "express";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/products", productRoutes);

// Home route
app.get("/", (_req, res) => {
  res.json({
    message: "CRUD API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});