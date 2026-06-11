import express from "express";
import connectDB from "./config.js";
import router from "./routes/routes.js";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/middleware.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

connectDB();

app.use("/api/v1", router);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});
