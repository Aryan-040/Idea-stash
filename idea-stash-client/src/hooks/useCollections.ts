import { useCallback, useState } from "react";
import { collectionApi } from "../api";
import type { Collection } from "../types/content";

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await collectionApi.list();
      setCollections(data.collections);
    } catch {
      setCollections([]);
    }
  }, []);

  const create = useCallback(
    async (name: string) => {
      await collectionApi.create(name);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await collectionApi.delete(id);
      await refresh();
    },
    [refresh],
  );

  return { collections, refresh, create, remove };
}
