import { useEffect } from "react";
import { getYouTubeEmbedUrl } from "../../utils/youtube";

interface YouTubePlayerModalProps {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}

export function YouTubePlayerModal({
  url,
  title,
  open,
  onClose,
}: YouTubePlayerModalProps) {
  const embedUrl = getYouTubeEmbedUrl(url);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {embedUrl ? (
          <iframe
            className="w-full h-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            Invalid YouTube URL
          </div>
        )}
      </div>
    </div>
  );
}
