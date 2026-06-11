import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {
  collectionSchema,
  contentSchema,
  moveContentSchema,
  searchSchema,
  userSchema,
} from "../validators/validators.js";
import { Collection, Content, Link, User } from "../models/model.js";
import { env } from "../config/env.js";
import { randomString } from "../utils/random-string-generator.js";
import { detectAndFetchMetadata } from "../services/metadataService.js";
import {
  generateContentSummary,
  isAiAvailable,
  semanticSearchQuery,
} from "../services/aiService.js";
import { detectContentType } from "../services/linkDetector.js";

function normalizeTags(tags?: string[]): string[] {
  if (!tags) return [];
  return [...new Set(tags.map((t) => t.replace(/^#/, "").toLowerCase().trim()).filter(Boolean))];
}

function serializeContent(doc: Record<string, unknown>) {
  return {
    ...doc,
    url: doc.url ?? doc.link,
    contentType: doc.contentType ?? doc.type ?? "website",
    type: doc.contentType ?? doc.type ?? "website",
  };
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const Signup = async (req: Request, res: Response) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success)
      return res.status(411).json({ message: "invalid inputs received" });

    const { username, password } = validation.data;
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(403).json({ message: "user already exists" });

    await User.create({ username, password });
    return res.status(201).json({ message: "user created successfully" });
  } catch (error) {
    console.log("Error while signingUp", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const Singin = async (req: Request, res: Response) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success)
      return res.status(411).json({ message: "invalid input credentials" });

    const { username, password } = validation.data;
    const user = await User.findOne({ username, password });

    if (user) {
      const token = jwt.sign({ id: user._id }, env.jwtSecret, {
        expiresIn: "7d",
      });
      return res.json({ token });
    }
    return res.status(403).json({ message: "incorrect credentials" });
  } catch (error) {
    console.log("Error while signingIn", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Content ──────────────────────────────────────────────────────────────

export const CreateContent = async (req: Request, res: Response) => {
  try {
    const validation = contentSchema.safeParse(req.body);
    if (!validation.success)
      return res.status(411).json({ message: "invalid content input" });

    const url = validation.data.url ?? validation.data.link;
    if (!url) return res.status(411).json({ message: "url is required" });

    const detected = await detectAndFetchMetadata(url);
    const contentType =
      validation.data.contentType ??
      validation.data.type ??
      detected.contentType ??
      detectContentType(url);

    let aiResult = null;
    if (isAiAvailable()) {
      aiResult = await generateContentSummary({
        title: validation.data.title ?? detected.title,
        url,
        contentType,
        metadata: detected.metadata as Record<string, unknown>,
      });
    }

    const createdContent = await Content.create({
      title: validation.data.title ?? detected.title,
      link: url,
      url,
      contentType,
      type: contentType,
      thumbnail: detected.thumbnail,
      metadata: detected.metadata,
      summary: aiResult?.summary,
      keyTakeaways: aiResult?.keyTakeaways ?? [],
      concepts: aiResult?.concepts ?? [],
      tags: normalizeTags(validation.data.tags),
      collectionId: validation.data.collectionId || null,
      userId: req.userId,
    });

    return res.json({
      message: "Content Added",
      content: serializeContent(createdContent.toObject()),
      aiEnabled: isAiAvailable(),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while creating content" });
  }
};

export const getContent = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, parseInt(String(req.query.limit ?? "20"), 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId: req.userId };
    if (req.query.collectionId) filter.collectionId = req.query.collectionId;
    if (req.query.contentType) filter.contentType = req.query.contentType;
    if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();

    const [content, total] = await Promise.all([
      Content.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username")
        .populate("collectionId", "name"),
      Content.countDocuments(filter),
    ]);

    return res.json({
      content: content.map((c) => serializeContent(c.toObject())),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.log("Error while fetching content", error);
    return res.status(500).json({ message: "Error while fetching content" });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  const { contentId } = req.body;
  if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
    return res.status(411).json({ message: "invalid contentId" });
  }

  try {
    const result = await Content.deleteOne({
      _id: contentId,
      userId: req.userId,
    });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Content not found or not authorized" });
    }
    return res.json({ message: "Deleted" });
  } catch (error) {
    console.log("Error while deleting content", error);
    return res.status(500).json({ message: "Error while deleting content" });
  }
};

export const regenerateSummary = async (req: Request, res: Response) => {
  const { contentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    return res.status(411).json({ message: "invalid contentId" });
  }

  try {
    const content = await Content.findOne({ _id: contentId, userId: req.userId });
    if (!content) return res.status(404).json({ message: "Content not found" });

    if (!isAiAvailable()) {
      return res.status(503).json({ message: "AI features not configured" });
    }

    const aiResult = await generateContentSummary({
      title: content.title,
      url: content.link,
      contentType: content.contentType ?? "website",
      metadata: (content.metadata as Record<string, unknown>) ?? {},
    });

    if (!aiResult) {
      return res.status(500).json({ message: "Failed to generate summary" });
    }

    content.summary = aiResult.summary;
    content.keyTakeaways = aiResult.keyTakeaways;
    content.concepts = aiResult.concepts;
    await content.save();

    return res.json({
      message: "Summary regenerated",
      content: serializeContent(content.toObject()),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error regenerating summary" });
  }
};

export const previewLink = async (req: Request, res: Response) => {
  const url = String(req.query.url ?? "");
  if (!url) return res.status(411).json({ message: "url is required" });

  try {
    const detected = await detectAndFetchMetadata(url);
    return res.json(detected);
  } catch {
    return res.status(500).json({ message: "Failed to preview link" });
  }
};

export const incrementView = async (req: Request, res: Response) => {
  const { contentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    return res.status(411).json({ message: "invalid contentId" });
  }

  await Content.updateOne(
    { _id: contentId, userId: req.userId },
    { $inc: { viewCount: 1 } },
  );
  return res.json({ message: "View recorded" });
};

// ─── Share ────────────────────────────────────────────────────────────────

export const shareBrain = async (req: Request, res: Response) => {
  const { share } = req.body;

  try {
    if (share) {
      const existingLink = await Link.findOne({ userId: req.userId });
      if (existingLink) return res.json({ hash: existingLink.hash });

      const createdlink = await Link.create({
        userId: req.userId,
        hash: randomString(50),
      });
      return res.json({ hash: createdlink.hash });
    }

    await Link.deleteOne({ userId: req.userId });
    return res.json({ message: "Removed Link" });
  } catch (error) {
    console.log("Error while creating the Link", error);
    return res.status(500).json({ message: "Error while sharing brain" });
  }
};

export const shareLink = async (req: Request, res: Response) => {
  const hash = req.params.shareLink;

  try {
    const link = await Link.findOne({ hash });
    if (!link)
      return res.status(400).json({ message: "sorry incorrect input recieved" });

    const content = await Content.find({ userId: link.userId });
    const user = await User.findOne({ _id: link.userId });
    if (!user) return res.status(400).json({ message: "user not found" });

    return res.status(200).json({
      username: user.username,
      content: content.map((c) => serializeContent(c.toObject())),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error while fetching shared content" });
  }
};

// ─── Collections ──────────────────────────────────────────────────────────

export const createCollection = async (req: Request, res: Response) => {
  const validation = collectionSchema.safeParse(req.body);
  if (!validation.success)
    return res.status(411).json({ message: "invalid collection name" });

  const collection = await Collection.create({
    name: validation.data.name,
    userId: req.userId,
  });
  return res.status(201).json({ collection });
};

export const getCollections = async (req: Request, res: Response) => {
  const collections = await Collection.find({ userId: req.userId }).sort({
    name: 1,
  });

  const counts = await Content.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
    { $group: { _id: "$collectionId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    counts.map((c) => [String(c._id ?? "none"), c.count as number]),
  );

  return res.json({
    collections: collections.map((c) => ({
      ...c.toObject(),
      itemCount: countMap.get(String(c._id)) ?? 0,
    })),
  });
};

export const updateCollection = async (req: Request, res: Response) => {
  const validation = collectionSchema.safeParse(req.body);
  if (!validation.success)
    return res.status(411).json({ message: "invalid collection name" });

  const updated = await Collection.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { name: validation.data.name },
    { new: true },
  );
  if (!updated) return res.status(404).json({ message: "Collection not found" });
  return res.json({ collection: updated });
};

export const deleteCollection = async (req: Request, res: Response) => {
  const deleted = await Collection.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!deleted) return res.status(404).json({ message: "Collection not found" });

  await Content.updateMany(
    { collectionId: deleted._id, userId: req.userId },
    { $set: { collectionId: null } },
  );
  return res.json({ message: "Collection deleted" });
};

export const moveContent = async (req: Request, res: Response) => {
  const validation = moveContentSchema.safeParse(req.body);
  if (!validation.success)
    return res.status(411).json({ message: "invalid move request" });

  const updated = await Content.findOneAndUpdate(
    { _id: validation.data.contentId, userId: req.userId },
    { collectionId: validation.data.collectionId },
    { new: true },
  );
  if (!updated) return res.status(404).json({ message: "Content not found" });
  return res.json({ content: serializeContent(updated.toObject()) });
};

// ─── Tags ─────────────────────────────────────────────────────────────────

export const getTags = async (req: Request, res: Response) => {
  const tags = await Content.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);

  return res.json({
    tags: tags.map((t) => ({ name: t._id, count: t.count })),
  });
};

export const updateContentTags = async (req: Request, res: Response) => {
  const { contentId, tags } = req.body;
  if (!contentId || !Array.isArray(tags)) {
    return res.status(411).json({ message: "invalid tags payload" });
  }

  const updated = await Content.findOneAndUpdate(
    { _id: contentId, userId: req.userId },
    { tags: normalizeTags(tags) },
    { new: true },
  );
  if (!updated) return res.status(404).json({ message: "Content not found" });
  return res.json({ content: serializeContent(updated.toObject()) });
};

// ─── Search ───────────────────────────────────────────────────────────────

export const searchContent = async (req: Request, res: Response) => {
  const validation = searchSchema.safeParse(req.query);
  if (!validation.success)
    return res.status(411).json({ message: "invalid search query" });

  const { q, mode, tag, contentType, collectionId } = validation.data;
  const page = validation.data.page ?? 1;
  const limit = validation.data.limit ?? 20;
  const skip = (page - 1) * limit;

  const baseFilter: Record<string, unknown> = { userId: req.userId };
  if (tag) baseFilter.tags = tag.toLowerCase();
  if (contentType) baseFilter.contentType = contentType;
  if (collectionId) baseFilter.collectionId = collectionId;

  if (mode === "semantic" && isAiAvailable()) {
    const allItems = await Content.find(baseFilter)
      .select("_id title summary tags contentType")
      .limit(200);
    const ids = await semanticSearchQuery(
      q,
      allItems.map((item) => ({
        id: String(item._id),
        title: item.title,
        summary: item.summary ?? undefined,
        tags: item.tags,
      })),
    );
    const ordered = ids.length
      ? await Content.find({ _id: { $in: ids }, userId: req.userId })
      : await Content.find({ ...baseFilter, $text: { $search: q } })
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(limit);

    const idOrder = new Map(ids.map((id, i) => [id, i]));
    ordered.sort(
      (a, b) =>
        (idOrder.get(String(a._id)) ?? 999) -
        (idOrder.get(String(b._id)) ?? 999),
    );

    return res.json({
      content: ordered.map((c) => serializeContent(c.toObject())),
      mode: "semantic",
    });
  }

  const [results, total] = await Promise.all([
    Content.find({ ...baseFilter, $text: { $search: q } })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Content.countDocuments({ ...baseFilter, $text: { $search: q } }),
  ]);

  return res.json({
    content: results.map((c) => serializeContent(c.toObject())),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    mode: "text",
  });
};

// ─── Dashboard ────────────────────────────────────────────────────────────

export const getDashboardStats = async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId);

  const [total, byType, recent, mostViewed, collections] = await Promise.all([
    Content.countDocuments({ userId }),
    Content.aggregate([
      { $match: { userId } },
      { $group: { _id: "$contentType", count: { $sum: 1 } } },
    ]),
    Content.find({ userId }).sort({ createdAt: -1 }).limit(5),
    Content.find({ userId }).sort({ viewCount: -1 }).limit(5),
    Collection.countDocuments({ userId }),
  ]);

  return res.json({
    total,
    collections,
    byType: byType.map((t) => ({ type: t._id ?? "unknown", count: t.count })),
    recent: recent.map((c) => serializeContent(c.toObject())),
    mostViewed: mostViewed.map((c) => serializeContent(c.toObject())),
    aiEnabled: isAiAvailable(),
  });
};

export const getAiStatus = (_req: Request, res: Response) => {
  return res.json({ aiEnabled: isAiAvailable() });
};
