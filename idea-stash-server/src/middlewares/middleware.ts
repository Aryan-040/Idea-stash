import { NextFunction, Request, Response, ErrorRequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers["authorization"];
    if (!header) {
      return res.status(403).json({ message: "sorry u are not logged in" });
    }

    const token = header.startsWith("Bearer ") ? header.slice(7) : header;
    const decoded = jwt.verify(token, env.jwtSecret) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(403).json({ message: "sorry u are not logged in" });
  }
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};
