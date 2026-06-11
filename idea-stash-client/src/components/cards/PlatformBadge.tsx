const BADGE_STYLES: Record<string, string> = {
  youtube: "bg-red-100 text-red-700",
  twitter: "bg-sky-100 text-sky-700",
  github: "bg-gray-100 text-gray-800",
  article: "bg-amber-100 text-amber-800",
  website: "bg-purple-100 text-purple-700",
};

export function PlatformBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${BADGE_STYLES[type] ?? BADGE_STYLES.website}`}
    >
      {type}
    </span>
  );
}
