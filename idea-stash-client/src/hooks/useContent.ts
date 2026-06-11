import { useCallback, useState } from "react";
import { contentApi } from "../api";
import type { ContentItem, Pagination } from "../types/content";

export function useContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async (params?: Record<string, string | number>) => {
      setLoading(true);
      try {
        const { data } = await contentApi.list(params);
        setContent(data.content);
        setPagination(data.pagination);
      } catch {
        setContent([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadMore = useCallback(async () => {
    if (!pagination || pagination.page >= pagination.pages) return;
    const { data } = await contentApi.list({
      page: pagination.page + 1,
      limit: pagination.limit,
    });
    setContent((prev) => [...prev, ...data.content]);
    setPagination(data.pagination);
  }, [pagination]);

  return { content, pagination, loading, refresh, loadMore };
}
