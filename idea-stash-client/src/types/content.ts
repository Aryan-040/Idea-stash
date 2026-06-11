export type ContentType =
  | "youtube"
  | "twitter"
  | "github"
  | "article"
  | "website";

export interface ContentMetadata {
  description?: string;
  thumbnail?: string;
  author?: string;
  siteName?: string;
  duration?: string;
  stars?: number;
  forks?: number;
  language?: string;
  ownerAvatar?: string;
  ownerName?: string;
  tweetText?: string;
  oembedHtml?: string;
}

export interface ContentItem {
  _id: string;
  title: string;
  link: string;
  url: string;
  contentType: ContentType;
  type: ContentType;
  thumbnail?: string;
  metadata?: ContentMetadata;
  summary?: string;
  keyTakeaways?: string[];
  concepts?: string[];
  tags?: string[];
  collectionId?: string | { _id: string; name: string } | null;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  _id: string;
  name: string;
  itemCount?: number;
}

export interface DashboardStats {
  total: number;
  collections: number;
  byType: { type: string; count: number }[];
  recent: ContentItem[];
  mostViewed: ContentItem[];
  aiEnabled: boolean;
}

export interface LinkPreview {
  contentType: ContentType;
  title: string;
  thumbnail?: string;
  metadata: ContentMetadata;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
