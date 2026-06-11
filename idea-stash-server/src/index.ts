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
    origin: (origin, callback) => {
      if (
        !origin ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin === env.frontendUrl
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

connectDB();

app.use("/api/v1", router);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});
