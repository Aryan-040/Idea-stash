export type ContentType =
  | "youtube"
  | "twitter"
  | "github"
  | "article"
  | "website";

export function detectContentType(url: string): ContentType {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "").toLowerCase();

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be"
    ) {
      return "youtube";
    }

    if (host === "twitter.com" || host === "x.com") {
      return "twitter";
    }

    if (host === "github.com") {
      return "github";
    }

    const articleHosts = [
      "medium.com",
      "dev.to",
      "hashnode.dev",
      "substack.com",
      "blogspot.com",
      "wordpress.com",
    ];

    if (
      articleHosts.some((h) => host === h || host.endsWith(`.${h}`)) ||
      parsed.pathname.includes("/blog/") ||
      parsed.pathname.includes("/article/")
    ) {
      return "article";
    }

    return "website";
  } catch {
    return "website";
  }
}
