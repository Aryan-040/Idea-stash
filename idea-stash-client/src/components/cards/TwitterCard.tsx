import { PlatformBadge } from "./PlatformBadge";
import type { ContentItem } from "../../types/content";
import TwitterPreview from "./TwitterPreview";

export function TwitterCard({ item }: { item: ContentItem }) {
  const meta = item.metadata ?? {};
  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative h-36">
        <TwitterPreview />
        <div className="absolute top-3 left-3">
          <PlatformBadge type="twitter" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mt-2 line-clamp-3">{meta.tweetText ?? item.title}</h3>
        {meta.oembedHtml ? (
          <div className="mt-3 text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: String(meta.oembedHtml) }} />
        ) : null}
        <div className="flex gap-2 mt-3">
          <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600">View Tweet</a>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(item.url ?? "")}
            className="text-sm text-gray-600"
          >
            Copy Link
          </button>
        </div>
      </div>
    </article>
  );
}
