import { useCallback, useState } from "react";
import { dashboardApi } from "../api";
import type { DashboardStats } from "../types/content";

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await dashboardApi.stats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, refresh };
}
