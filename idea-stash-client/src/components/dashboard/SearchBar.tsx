interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  semantic?: boolean;
  onToggleSemantic?: () => void;
  aiEnabled?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  semantic,
  onToggleSemantic,
  aiEnabled,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="flex-1 relative">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder='Search your brain... e.g. "dynamic programming videos"'
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <button
        onClick={onSearch}
        className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700"
      >
        Search
      </button>
      {aiEnabled && onToggleSemantic && (
        <button
          onClick={onToggleSemantic}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            semantic
              ? "bg-purple-100 border-purple-300 text-purple-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {semantic ? "AI Search ✓" : "AI Search"}
        </button>
      )}
    </div>
  );
}
