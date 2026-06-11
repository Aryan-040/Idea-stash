import { useEffect, useRef, useState } from "react";
import { CrossIcon } from "../../icons/CrossIcon";
import { Button } from "./Button";
import { InputBox } from "./InputBox";
import { contentApi } from "../../api";
import { useToast } from "../../hooks/useToast";
import type { LinkPreview } from "../../types/content";
import { PlatformBadge } from "../cards/PlatformBadge";
import { detectContentTypeFromUrl } from "../../utils/youtube";

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateContentModal({
  open,
  onClose,
  onCreated,
}: CreateContentModalProps) {
  const { toast } = useToast();
  const urlRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setPreview(null);
    }
  }, [open]);

  async function handleUrlBlur() {
    const raw = urlRef.current?.value.trim();
    const url = normalizeUrl(raw);
    if (!url) {
      setPreview(null);
      return;
    }

    setPreviewLoading(true);
    try {
      const { data } = await contentApi.preview(url);
      setPreview(data);
    } catch {
      setPreview({
        contentType: detectContentTypeFromUrl(url) as LinkPreview["contentType"],
        title: url,
        metadata: {},
      });
    } finally {
      setPreviewLoading(false);
    }
  }

  async function addContent() {
    const raw = urlRef.current?.value.trim();
    const url = normalizeUrl(raw);
    if (!url) {
      toast("Please paste a URL", "error");
      return;
    }

    const tags = tagsRef.current?.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      await contentApi.create({ url, tags });
      toast("Content saved!", "success");
      onCreated();
      onClose();
    } catch {
      toast("Failed to save content", "error");
    } finally {
      setSaving(false);
    }
  }

  function normalizeUrl(raw?: string) {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    // add https if protocol missing
    return `https://${trimmed}`;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Save to Brain</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <CrossIcon />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Paste a link
            </label>
            <InputBox
              ref={urlRef}
              placeholder="https://youtube.com/watch?v=..."
              onBlur={handleUrlBlur}
            />
            <p className="text-xs text-gray-400 mt-1">
              Supports YouTube, Twitter/X, GitHub, articles, and websites
            </p>
          </div>

          {previewLoading && (
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          )}

          {preview && !previewLoading && (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-start gap-3">
                {preview.thumbnail && (
                  <img
                    src={preview.thumbnail}
                    alt=""
                    className="w-20 h-14 object-cover rounded-lg shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <PlatformBadge type={preview.contentType} />
                  <p className="font-medium text-gray-900 mt-1 line-clamp-2 text-sm">
                    {preview.title}
                  </p>
                  {preview.metadata.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {preview.metadata.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags (optional)
            </label>
            <InputBox
              ref={tagsRef}
              placeholder="react, aws, systemdesign"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            text={saving ? "Saving..." : "Save to Brain"}
            onClick={addContent}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
