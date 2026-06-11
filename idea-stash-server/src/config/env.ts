import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  MONGO_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(8, "JWT_SECRET must be at least 8 characters"),
  PORT: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

const mongoUrl = parsed.data.MONGO_URL ?? parsed.data.MONGODB_URI;
if (!mongoUrl) {
  throw new Error("MONGO_URL or MONGODB_URI must be set");
}

export const env = {
  mongoUrl,
  jwtSecret: parsed.data.JWT_SECRET,
  port: parsed.data.PORT ? parseInt(parsed.data.PORT, 10) : 3000,
  openaiApiKey: parsed.data.OPENAI_API_KEY,
  frontendUrl: parsed.data.FRONTEND_URL ?? "http://localhost:5173",
};
