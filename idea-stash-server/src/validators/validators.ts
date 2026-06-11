import z from "zod";

export const userSchema = z.object({
  username: z.string().min(3).max(13),
  password: z.string().min(4),
});

export const contentSchema = z.object({
  url: z.string().url().optional(),
  link: z.string().url().optional(),
  title: z.string().min(1).max(300).optional(),
  contentType: z
    .enum(["youtube", "twitter", "github", "article", "website"])
    .optional(),
  type: z.string().optional(),
  tags: z.array(z.string()).optional(),
  collectionId: z.string().optional(),
});

export const collectionSchema = z.object({
  name: z.string().min(1).max(50),
});

export const moveContentSchema = z.object({
  contentId: z.string(),
  collectionId: z.string().nullable(),
});

export const searchSchema = z.object({
  q: z.string().min(1),
  mode: z.enum(["text", "semantic"]).optional(),
  tag: z.string().optional(),
  contentType: z
    .enum(["youtube", "twitter", "github", "article", "website"])
    .optional(),
  collectionId: z.string().optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});
