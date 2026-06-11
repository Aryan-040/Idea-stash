import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shareApi } from "../api";
import { RichContentCard } from "../components/cards/RichContentCard";
import { ContentCardSkeleton } from "../components/ui/Skeleton";
import type { ContentItem } from "../types/content";

export function SharedBrain() {
  const { shareId } = useParams();
  const [username, setUsername] = useState("");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareId) return;
    shareApi
      .get(shareId)
      .then(({ data }) => {
        setUsername(data.username);
        setContent(data.content);
      })
      .catch(() => setError("Shared brain not found or link is invalid."))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">
            {username}&apos;s Brain
          </h1>
          <p className="text-gray-500 text-sm mt-1">Shared collection · read only</p>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {content.map((item) => (
            <RichContentCard key={item._id} item={item} readOnly />
          ))}
        </div>
      </div>
    </div>
  );
}
