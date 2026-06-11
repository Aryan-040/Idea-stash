interface CollectionSidebarProps {
  selectedCategory?: string | null;
  onSelectCategory?: (type: string | null) => void;
}

export function CollectionSidebar({ selectedCategory = null, onSelectCategory, }: CollectionSidebarProps) {
  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-6">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</h3>
          <div className="space-y-1">
            {[
              { id: null, label: "All Content", key: "all" },
              { id: "youtube", label: "YouTube", key: "youtube" },
              { id: "twitter", label: "Twitter/X", key: "twitter" },
              { id: "github", label: "GitHub", key: "github" },
              { id: "article", label: "Articles", key: "article" },
              { id: "website", label: "Websites", key: "website" },
            ].map((c) => (
              <button
                key={c.key}
                onClick={() => onSelectCategory?.(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === c.id
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
