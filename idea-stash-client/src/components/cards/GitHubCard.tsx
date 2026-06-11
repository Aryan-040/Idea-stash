import { PlatformBadge } from "./PlatformBadge";
import type { ContentItem } from "../../types/content";
import { getThumbnail } from "../../utils/thumbnail";

export function GitHubCard({ item }: { item: ContentItem }) {
  const meta = item.metadata ?? {};
  const thumb = getThumbnail(item);
  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative h-36 bg-gray-50">
        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <PlatformBadge type="github" />
            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
            {meta.description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{meta.description}</p>}
            <div className="flex gap-2 text-xs text-gray-600 mt-2">
              {meta.stars != null && <span>⭐ {meta.stars}</span>}
              {meta.forks != null && <span>🍴 {meta.forks}</span>}
              {meta.language && <span className="px-2 py-0.5 bg-gray-100 rounded">{meta.language}</span>}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
