import { PlatformBadge } from "./PlatformBadge";
import type { ContentItem } from "../../types/content";
import { getThumbnail } from "../../utils/thumbnail";

export function ArticleCard({ item }: { item: ContentItem }) {
  const meta = item.metadata ?? {};
  const thumb = getThumbnail(item);
  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative h-44 bg-gray-50">
        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <PlatformBadge type="article" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{meta.siteName}</p>
        {meta.description && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{meta.description}</p>}
      </div>
    </article>
  );
}
