export function getPlatformFallback(type: string) {
  switch (type) {
    case "youtube":
      return "/assets/platforms/youtube.png";
    case "twitter":
      return "/assets/platforms/twitter.png";
    case "github":
      return "/assets/platforms/github.png";
    case "article":
      return "/assets/platforms/article.png";
    default:
      return "/assets/platforms/website.png";
  }
}

export function getYouTubeMaxRes(urlOrId: string) {
  // accept either full URL or id
  try {
    const url = new URL(urlOrId);
    const host = url.hostname.replace("www.", "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
    if (host.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://img.youtube.com/vi/${v}/maxresdefault.jpg`;
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("embed");
      if (idx !== -1 && parts[idx + 1]) return `https://img.youtube.com/vi/${parts[idx+1]}/maxresdefault.jpg`;
    }
  } catch {
    // assume id
    return `https://img.youtube.com/vi/${urlOrId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${urlOrId}/maxresdefault.jpg`;
}

export function getThumbnail(item: any) {
  // prefer explicit thumbnail
  if (item?.thumbnail) return item.thumbnail;
  // guard against empty inline data URLs like "data:," which produce no visible image
  const metaThumb = item?.metadata?.thumbnail;
  if (metaThumb && !/^data:\s*,?$/i.test(metaThumb)) return metaThumb;

  const type = item?.contentType ?? item?.type ?? "website";

  // YouTube special case: try to compute maxres thumbnail from URL
  if (type === "youtube") {
    const url = item.url ?? item.link ?? "";
    const img = getYouTubeMaxRes(url);
    return img || getPlatformFallback("youtube");
  }

  // GitHub: owner avatar first
  if (type === "github") {
    const ownerAvatar = item?.metadata?.ownerAvatar ?? item?.metadata?.owner?.avatar_url;
    if (ownerAvatar) return ownerAvatar;
    // fallback to github user avatar pattern if title contains owner
    try {
      const parsed = new URL(item.url);
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 1) return `https://github.com/${parts[0]}.png`;
    } catch {
      // ignore
    }
    return getPlatformFallback("github");
  }

  // Twitter: try metadata thumbnail, then author avatar
  if (type === "twitter") {
    // Do not return tweet media or pbs.twimg.com images. Always use platform fallback
    return getPlatformFallback("twitter");
  }

  // Article / Website: OG image then favicon
  if (type === "article" || type === "website") {
    if (item?.metadata?.thumbnail) return item.metadata.thumbnail;
    // attempt favicon via google s2
    try {
      const hostname = new URL(item.url ?? item.link).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}`;
    } catch {
      return getPlatformFallback(type === "article" ? "article" : "website");
    }
  }

  return getPlatformFallback(type);
}
