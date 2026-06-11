import { api } from "./client";
import type {
  Collection,
  ContentItem,
  DashboardStats,
  LinkPreview,
  Pagination,
} from "../types/content";

export const authApi = {
  signup: (username: string, password: string) =>
    api.post("/signup", { username, password }),
  signin: (username: string, password: string) =>
    api.post<{ token: string }>("/signin", { username, password }),
};

export const contentApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<{ content: ContentItem[]; pagination: Pagination }>("/content", {
      params,
    }),
  create: (data: {
    url: string;
    title?: string;
    tags?: string[];
    collectionId?: string;
    // optional preview data may be sent by the client but server can ignore it
    previewData?: any;
  }) => api.post<{ content: ContentItem }>("/content", data),
  delete: (contentId: string) =>
    api.delete("/delete", { data: { contentId } }),
  preview: (url: string) =>
    api.get<LinkPreview>("/content/preview", { params: { url } }),
  regenerate: (contentId: string) =>
    api.post<{ content: ContentItem }>(`/content/${contentId}/regenerate`),
  recordView: (contentId: string) =>
    api.post(`/content/${contentId}/view`),
  updateTags: (contentId: string, tags: string[]) =>
    api.patch<{ content: ContentItem }>("/content/tags", { contentId, tags }),
  move: (contentId: string, collectionId: string | null) =>
    api.patch<{ content: ContentItem }>("/content/move", {
      contentId,
      collectionId,
    }),
};

export const collectionApi = {
  list: () => api.get<{ collections: Collection[] }>("/collections"),
  create: (name: string) =>
    api.post<{ collection: Collection }>("/collections", { name }),
  rename: (id: string, name: string) =>
    api.patch<{ collection: Collection }>(`/collections/${id}`, { name }),
  delete: (id: string) => api.delete(`/collections/${id}`),
};

export const searchApi = {
  search: (params: Record<string, string | number>) =>
    api.get<{ content: ContentItem[]; mode: string }>("/search", { params }),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/dashboard/stats"),
};

export const shareApi = {
  create: () => api.post<{ hash: string }>("/share", { share: true }),
  get: (hash: string) =>
    api.get<{ username: string; content: ContentItem[] }>(`/share/${hash}`),
};

export const tagsApi = {
  list: () => api.get<{ tags: { name: string; count: number }[] }>("/tags"),
};
