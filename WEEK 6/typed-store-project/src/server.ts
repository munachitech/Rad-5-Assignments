import "dotenv/config";
import { app } from "./app";
import { connectRedis } from "./cache";

const port = Number(process.env["PORT"] ?? 3000);

void connectRedis();

app.listen(port, () => {
  console.log(`Store API listening on port ${port}`);
});