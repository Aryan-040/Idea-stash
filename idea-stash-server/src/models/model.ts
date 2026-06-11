import mongoose from "mongoose";

const userModel = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const collectionModel = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const contentModel = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true },
    url: { type: String },
    contentType: {
      type: String,
      enum: ["youtube", "twitter", "github", "article", "website"],
      default: "website",
    },
    type: { type: String },
    thumbnail: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    summary: { type: String },
    keyTakeaways: [{ type: String }],
    concepts: [{ type: String }],
    tags: [{ type: String, trim: true, lowercase: true }],
    collectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
      default: null,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

contentModel.index({
  title: "text",
  summary: "text",
  tags: "text",
  "metadata.description": "text",
});

const linkModel = new mongoose.Schema(
  {
    hash: { type: String },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userModel);
export const Collection = mongoose.model("Collection", collectionModel);
export const Content = mongoose.model("Content", contentModel);
export const Link = mongoose.model("Link", linkModel);
