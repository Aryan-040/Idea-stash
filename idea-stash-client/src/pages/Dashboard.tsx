import { useEffect, useState, useCallback } from "react";
import { Button } from "../components/ui/Button";
import { CreateContentModal } from "../components/ui/Create-Content-Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { ContentCardSkeleton } from "../components/ui/Skeleton";
import { RichContentCard } from "../components/cards/RichContentCard";
import { StatsBar } from "../components/dashboard/StatsBar";
import { SearchBar } from "../components/dashboard/SearchBar";
import { CollectionSidebar } from "../components/dashboard/CollectionSidebar";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { Logo } from "../icons/Logo";
import { useContent } from "../hooks/useContent";
// collections removed
import { useDashboard } from "../hooks/useDashboard";
import { shareApi, searchApi, tagsApi } from "../api";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import type { ContentItem } from "../types/content";

export function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  // collections removed
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [semanticSearch, setSemanticSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<ContentItem[] | null>(
    null,
  );
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);

  const { content, loading, refresh, loadMore, pagination } = useContent();
  const { stats, loading: statsLoading, refresh: refreshStats } = useDashboard();

  const displayContent = searchResults ?? content;

  const reload = useCallback(() => {
    const params: Record<string, string | number> = {};
    if (selectedCategory) params.contentType = selectedCategory;
    if (activeTag) params.tag = activeTag;
    refresh(params);
    refreshStats();
    tagsApi.list().then(({ data }) => setTags(data.tags)).catch(() => {});
    setSearchResults(null);
  }, [activeTag, refresh, refreshStats, selectedCategory]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const { data } = await searchApi.search({
        q: searchQuery,
        mode: semanticSearch ? "semantic" : "text",
        ...(selectedCategory ? { contentType: selectedCategory } : {}),
        ...(activeTag ? { tag: activeTag } : {}),
      });
      setSearchResults(data.content);
    } catch {
      toast("Search failed", "error");
    }
  }

  async function handleShare() {
    try {
      const { data } = await shareApi.create();
      const shareUrl = `${window.location.origin}/share/${data.hash}`;
      await navigator.clipboard.writeText(shareUrl);
      toast("Share link copied!", "success");
    } catch {
      toast("Failed to create share link", "error");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-bold text-gray-900 hidden sm:block">
              Idea Stash
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              text="Add"
              onClick={() => setModalOpen(true)}
              variant="primary"
              size="md"
              startIcon={<PlusIcon size="md" />}
            />
            <Button
              text="Share"
              onClick={handleShare}
              variant="secondary"
              size="md"
              startIcon={<ShareIcon size="md" />}
            />
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <StatsBar stats={stats} loading={statsLoading} />

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          semantic={semanticSearch}
          onToggleSemantic={() => setSemanticSearch((s) => !s)}
          aiEnabled={stats?.aiEnabled}
        />

        {/* Tag filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !activeTag
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {tags.slice(0, 10).map((t) => (
              <button
                key={t.name}
                onClick={() =>
                  setActiveTag(activeTag === t.name ? null : t.name)
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTag === t.name
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                #{t.name} ({t.count})
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-6">
          <CollectionSidebar
            selectedCategory={selectedCategory}
            onSelectCategory={(c) => {
              setSelectedCategory(c);
            }}
          />

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ContentCardSkeleton key={i} />
                ))}
              </div>
            ) : displayContent.length === 0 ? (
              <EmptyState
                title="Your second brain is empty"
                description="Paste a YouTube video, tweet, GitHub repo, or article to get started."
                action={
                  <Button
                    text="Save your first link"
                    onClick={() => setModalOpen(true)}
                    variant="primary"
                    size="md"
                  />
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayContent.map((item) => {
                    const type = item.contentType ?? item.type ?? "website";
                    if (type === "youtube") {
                      return (
                        <div key={item._id}>
                          <RichContentCard
                            item={item}
                            onDelete={reload}
                            onRegenerate={reload}
                            aiEnabled={stats?.aiEnabled}
                          />
                        </div>
                      );
                    }
                    if (type === "github") {
                      return (
                        <div key={item._id}>
                          {/* GitHub card */}
                          <div className="h-full">
                            {/* reuse RichContentCard for actions but show GitHubCard content inside */}
                            <RichContentCard
                              item={item}
                              onDelete={reload}
                              onRegenerate={reload}
                              aiEnabled={stats?.aiEnabled}
                            />
                          </div>
                        </div>
                      );
                    }
                    if (type === "article") {
                      return (
                        <div key={item._id}>
                          <RichContentCard
                            item={item}
                            onDelete={reload}
                            onRegenerate={reload}
                            aiEnabled={stats?.aiEnabled}
                          />
                        </div>
                      );
                    }
                    if (type === "twitter") {
                      return (
                        <div key={item._id}>
                          <RichContentCard
                            item={item}
                            onDelete={reload}
                            onRegenerate={reload}
                            aiEnabled={stats?.aiEnabled}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={item._id}>
                        <RichContentCard
                          item={item}
                          onDelete={reload}
                          onRegenerate={reload}
                          aiEnabled={stats?.aiEnabled}
                        />
                      </div>
                    );
                  })}
                </div>
                {!searchResults && pagination && pagination.page < pagination.pages && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      className="px-6 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-white"
                    >
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <CreateContentModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={reload} />
    </div>
  );
}
