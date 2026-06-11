import { useState } from "react";
import type { ContentItem } from "../../types/content";
import { PlatformBadge } from "./PlatformBadge";
import { YouTubePlayerModal } from "./YouTubePlayerModal";
import { formatDate } from "../../utils/youtube";
import { getThumbnail } from "../../utils/thumbnail";
import { contentApi } from "../../api";
import { useToast } from "../../hooks/useToast";
import { DeleteIcon } from "../../icons/DeleteIcon";

interface RichContentCardProps {
  item: ContentItem;
  onDelete?: () => void;
  onRegenerate?: () => void;
  readOnly?: boolean;
  aiEnabled?: boolean;
}

export function RichContentCard({
  item,
  onDelete,
  onRegenerate,
  readOnly = false,
  aiEnabled = false,
}: RichContentCardProps) {
  const { toast } = useToast();
  const [playerOpen, setPlayerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const type = item.contentType ?? item.type ?? "website";
  const url = item.url ?? item.link;
  const meta = item.metadata ?? {};

  async function handleDelete() {
    if (!confirm("Delete this item?")) return;
    try {
      await contentApi.delete(item._id);
      toast("Content deleted", "success");
      onDelete?.();
    } catch {
      toast("Failed to delete", "error");
    }
  }

  async function handleRegenerate() {
    setLoading(true);
    try {
      await contentApi.regenerate(item._id);
      toast("Summary regenerated", "success");
      onRegenerate?.();
    } catch {
      toast("AI summary unavailable", "error");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(url);
    toast("Link copied", "success");
  }

  function openExternal() {
    if (!readOnly) contentApi.recordView(item._id).catch(() => {});
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <article className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
        {/* Thumbnail / preview */}
        <div className="relative h-44 bg-gray-100 shrink-0">
          <img
            src={getThumbnail(item)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <PlatformBadge type={type} />
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">
              {item.title}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(item.createdAt)}
              {item.viewCount ? ` · ${item.viewCount} views` : ""}
            </p>
          </div>

          {/* Type-specific metadata */}
          {type === "github" && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              {meta.stars != null && <span>⭐ {meta.stars}</span>}
              {meta.forks != null && <span>🍴 {meta.forks}</span>}
              {meta.language && (
                <span className="px-2 py-0.5 bg-gray-100 rounded">{meta.language}</span>
              )}
            </div>
          )}

          {type === "twitter" && meta.tweetText && (
            <p className="text-sm text-gray-600 line-clamp-3">{meta.tweetText}</p>
          )}

          {(type === "article" || type === "website") && meta.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{meta.description}</p>
          )}

          {item.summary && (
            <p className="text-sm text-gray-600 line-clamp-3 bg-purple-50 rounded-lg p-2">
              {item.summary}
            </p>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {type === "youtube" && (
              <button
                onClick={() => setPlayerOpen(true)}
                className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Play Inside App
              </button>
            )}
            <button
              onClick={openExternal}
              className="flex-1 min-w-[100px] px-3 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {type === "youtube"
                ? "Open on YouTube"
                : type === "github"
                  ? "Open Repository"
                  : type === "article"
                    ? "Read Article"
                    : type === "twitter"
                      ? "View Tweet"
                      : "Open Link"}
            </button>
            {type === "twitter" && (
              <button
                onClick={copyLink}
                className="px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Copy Link
              </button>
            )}
            {aiEnabled && !readOnly && (
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="px-3 py-2 text-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50"
              >
                {loading ? "..." : "Regenerate Summary"}
              </button>
            )}
            {!readOnly && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg ml-auto"
                aria-label="Delete"
              >
                <DeleteIcon />
              </button>
            )}
          </div>
        </div>
      </article>

      {type === "youtube" && (
        <YouTubePlayerModal
          url={url}
          title={item.title}
          open={playerOpen}
          onClose={() => setPlayerOpen(false)}
        />
      )}
    </>
  );
}
