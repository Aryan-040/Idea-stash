import * as cheerio from "cheerio";
import { detectContentType, type ContentType } from "./linkDetector.js";
import {
  extractYouTubeVideoId,
  getYouTubeThumbnail,
} from "../utils/youtube.js";

export interface ContentMetadata {
  title?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  siteName?: string;
  duration?: string;
  stars?: number;
  forks?: number;
  language?: string;
  ownerAvatar?: string;
  ownerName?: string;
  tweetText?: string;
  oembedHtml?: string;
}

export interface DetectedContent {
  contentType: ContentType;
  title: string;
  thumbnail?: string;
  metadata: ContentMetadata;
}

async function fetchYouTubeMetadata(url: string): Promise<DetectedContent> {
  const videoId = extractYouTubeVideoId(url);
  const thumbnail = getYouTubeThumbnail(url) ?? undefined;

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    );
    if (res.ok) {
      const data = (await res.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };
      return {
        contentType: "youtube",
        title: data.title ?? "YouTube Video",
        thumbnail: data.thumbnail_url ?? thumbnail,
        metadata: {
          author: data.author_name,
          thumbnail: data.thumbnail_url ?? thumbnail,
        },
      };
    }
  } catch {
    /* fallback below */
  }

  return {
    contentType: "youtube",
    title: videoId ? `YouTube Video (${videoId})` : "YouTube Video",
    thumbnail,
    metadata: { thumbnail },
  };
}

async function fetchGitHubMetadata(url: string): Promise<DetectedContent> {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length < 2) {
    return { contentType: "github", title: "GitHub Repository", metadata: {} };
  }
  const owner = parts[0];
  let repo = parts[1];
  repo = repo.replace(/\.git$/, "");

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        name?: string;
        full_name?: string;
        description?: string;
        stargazers_count?: number;
        forks_count?: number;
        language?: string;
        owner?: { avatar_url?: string; login?: string };
      };
      const thumbnail = data.owner?.avatar_url ?? undefined;
      return {
        contentType: "github",
        title: data.full_name ?? `${owner}/${repo}`,
        thumbnail,
        metadata: {
          description: data.description ?? undefined,
          stars: data.stargazers_count,
          forks: data.forks_count,
          language: data.language ?? undefined,
          ownerAvatar: data.owner?.avatar_url,
          ownerName: data.owner?.login,
          siteName: "GitHub",
        },
      };
    }
  } catch {
    /* fallback */
  }

  return {
    contentType: "github",
    title: `${owner}/${repo}`,
    metadata: { siteName: "GitHub" },
  };
}

async function fetchOpenGraphMetadata(
  url: string,
  contentType: ContentType,
): Promise<DetectedContent> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "IdeaStashBot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ??
      $('meta[name="twitter:title"]').attr("content") ??
      $("title").text().trim() ??
      url;

    const description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      $('meta[name="twitter:description"]').attr("content");

    let thumbnail =
      $('meta[property="og:image"]').attr("content") ??
      $('meta[name="twitter:image"]').attr("content");

    // if no OG image, look for link icons
    if (!thumbnail) {
      const iconHref =
        $('link[rel="icon"]').attr("href") ??
        $('link[rel="shortcut icon"]').attr("href") ??
        $('link[rel="apple-touch-icon"]').attr("href");
      if (iconHref) {
        try {
          thumbnail = new URL(iconHref, url).href;
        } catch {
          thumbnail = iconHref;
        }
      }
    }

    // final fallback to Google favicon service
    if (!thumbnail) {
      try {
        const hostname = new URL(url).hostname;
        thumbnail = `https://www.google.com/s2/favicons?domain=${hostname}`;
      } catch {
        thumbnail = undefined;
      }
    }

    const author =
      $('meta[name="author"]').attr("content") ??
      $('meta[property="article:author"]').attr("content");

    const siteName =
      $('meta[property="og:site_name"]').attr("content") ?? new URL(url).hostname;

    return {
      contentType,
      title: title.slice(0, 200),
      thumbnail,
      metadata: {
        description: description?.slice(0, 500),
        thumbnail,
        author,
        siteName,
      },
    };
  } catch {
    return {
      contentType,
      title: new URL(url).hostname,
      metadata: { siteName: new URL(url).hostname },
    };
  }
}

async function fetchTwitterMetadata(url: string): Promise<DetectedContent> {
  const normalized = url.replace("x.com", "twitter.com");
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalized)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as {
        author_name?: string;
        html?: string;
      };
      const textMatch = data.html?.match(/<p[^>]*>(.*?)<\/p>/);
      const tweetText = textMatch ? textMatch[1].replace(/<[^>]+>/g, "") : undefined;

      // try to extract images from oembed html
      let thumbnail: string | undefined = undefined;
      if (data.html) {
        const $ = cheerio.load(data.html);
        const img = $("img").first().attr("src");
        if (img) thumbnail = img;
      }

      // fallback: try fetching tweet page OG image
      if (!thumbnail) {
        try {
          const pageRes = await fetch(normalized, { headers: { "User-Agent": "IdeaStashBot/1.0" }, signal: AbortSignal.timeout(5000) });
          if (pageRes.ok) {
            const pageHtml = await pageRes.text();
            const $p = cheerio.load(pageHtml);
            const og = $p('meta[property="og:image"]').attr('content') ?? $p('meta[name="twitter:image"]').attr('content');
            if (og) thumbnail = og;
          }
        } catch {
          /* ignore */
        }
      }

      // final fallback to twitter icon
      if (!thumbnail) {
        thumbnail = 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png';
      }

      return {
        contentType: "twitter",
        title: data.author_name ? `Tweet by ${data.author_name}` : "Twitter Post",
        thumbnail,
        metadata: {
          author: data.author_name,
          tweetText,
          siteName: "Twitter/X",
          oembedHtml: data.html,
        },
      };
    }
  } catch {
    /* fallback */
  }

  return {
    contentType: "twitter",
    title: "Twitter Post",
    metadata: { siteName: "Twitter/X" },
  };
}

export async function detectAndFetchMetadata(
  url: string,
): Promise<DetectedContent> {
  const contentType = detectContentType(url);

  switch (contentType) {
    case "youtube":
      return fetchYouTubeMetadata(url);
    case "github":
      return fetchGitHubMetadata(url);
    case "twitter":
      return fetchTwitterMetadata(url);
    case "article":
    case "website":
      return fetchOpenGraphMetadata(url, contentType);
  }
}
