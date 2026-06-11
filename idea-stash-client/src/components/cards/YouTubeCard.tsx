import { PlatformBadge } from "./PlatformBadge";
import type { ContentItem } from "../../types/content";
import { getThumbnail } from "../../utils/thumbnail";

export function YouTubeCard({ item }: { item: ContentItem }) {
  const thumb = getThumbnail(item);
  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative h-44 bg-black/5">
        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3">
          <PlatformBadge type="youtube" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
        <p className="text-xs text-gray-400 mt-2">{item.metadata?.author}</p>
      </div>
    </article>
  );
}
