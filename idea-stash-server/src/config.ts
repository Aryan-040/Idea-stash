import mongoose from "mongoose";
import { env } from "./config/env.js";

async function connectDB() {
  await mongoose
    .connect(env.mongoUrl)
    .then(() => console.log("connected to database ✅"))
    .catch((err) => {
      console.log("Error connecting to the database ❌", err);
      process.exit(1);
    });
}

export default connectDB;
