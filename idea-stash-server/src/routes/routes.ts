import express from "express";
import {
  CreateContent,
  Singin,
  Signup,
  createCollection,
  deleteCollection,
  deleteContent,
  getAiStatus,
  getCollections,
  getContent,
  getDashboardStats,
  getTags,
  incrementView,
  moveContent,
  previewLink,
  regenerateSummary,
  searchContent,
  shareBrain,
  shareLink,
  updateCollection,
  updateContentTags,
} from "../controllers/controllers.js";
import { userMiddleware } from "../middlewares/middleware.js";

const router = express.Router();

// Auth
router.post("/signup", Signup);
router.post("/signin", Singin);

// Content
router.post("/content", userMiddleware, CreateContent);
router.get("/content", userMiddleware, getContent);
router.delete("/delete", userMiddleware, deleteContent);
router.get("/content/preview", userMiddleware, previewLink);
router.post("/content/:contentId/regenerate", userMiddleware, regenerateSummary);
router.post("/content/:contentId/view", userMiddleware, incrementView);
router.patch("/content/tags", userMiddleware, updateContentTags);
router.patch("/content/move", userMiddleware, moveContent);

// Share
router.post("/share", userMiddleware, shareBrain);
router.get("/share/:shareLink", shareLink);

// Collections
router.get("/collections", userMiddleware, getCollections);
router.post("/collections", userMiddleware, createCollection);
router.patch("/collections/:id", userMiddleware, updateCollection);
router.delete("/collections/:id", userMiddleware, deleteCollection);

// Tags & Search
router.get("/tags", userMiddleware, getTags);
router.get("/search", userMiddleware, searchContent);

// Dashboard
router.get("/dashboard/stats", userMiddleware, getDashboardStats);
router.get("/ai/status", userMiddleware, getAiStatus);

export default router;
