import type { DashboardStats } from "../../types/content";

interface StatsBarProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white border border-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getCount = (k: string) => stats.byType.find((t) => t.type === k)?.count ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <p className="text-xs text-gray-500">Total Saved</p>
        <p className="text-xl font-semibold mt-1 text-gray-900">{stats.total}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <p className="text-xs text-gray-500">YouTube</p>
        <p className="text-xl font-semibold mt-1 text-gray-900">{getCount('youtube')}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <p className="text-xs text-gray-500">GitHub</p>
        <p className="text-xl font-semibold mt-1 text-gray-900">{getCount('github')}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <p className="text-xs text-gray-500">Articles</p>
        <p className="text-xl font-semibold mt-1 text-gray-900">{getCount('article') + getCount('website')}</p>
      </div>
    </div>
  );
}
