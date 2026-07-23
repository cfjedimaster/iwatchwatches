import Parser from "rss-parser";
import { db } from "../db";
import { feedItems, feeds } from "../db/schema";

type CustomItem = {
  content?: string;
  contentSnippet?: string;
  "content:encoded"?: string;
  enclosure?: { url?: string; type?: string };
  "media:content"?: { $?: { url?: string; medium?: string; type?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
  "media:group"?: {
    "media:content"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
    "media:thumbnail"?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>;
  };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  timeout: 15000,
  headers: {
    "User-Agent": "IWatchWatchesBot/1.0 (+https://iwatchwatches.netlify.app)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["content:encoded", "content:encoded"],
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["media:group", "media:group"],
    ],
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function synopsisFromItem(item: CustomItem & { contentSnippet?: string; summary?: string }): string | null {
  const raw =
    item.contentSnippet ||
    item.summary ||
    (item["content:encoded"] ? stripHtml(item["content:encoded"]) : "") ||
    (item.content ? stripHtml(item.content) : "");

  if (!raw) return null;
  return raw.length > 280 ? `${raw.slice(0, 277).trimEnd()}…` : raw;
}

function firstImgFromHtml(html?: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function mediaUrl(
  value:
    | { $?: { url?: string; medium?: string; type?: string } }
    | Array<{ $?: { url?: string; medium?: string; type?: string } }>
    | undefined,
): string | null {
  if (!value) return null;
  const entry = Array.isArray(value) ? value[0] : value;
  return entry?.$?.url ?? null;
}

function imageFromItem(item: CustomItem): string | null {
  if (item.enclosure?.url) {
    const type = item.enclosure.type ?? "";
    if (!type || type.startsWith("image/")) return item.enclosure.url;
  }

  const mediaContent = mediaUrl(item["media:content"]);
  if (mediaContent) return mediaContent;

  const mediaThumb = mediaUrl(item["media:thumbnail"]);
  if (mediaThumb) return mediaThumb;

  const groupContent = mediaUrl(item["media:group"]?.["media:content"]);
  if (groupContent) return groupContent;

  const groupThumb = mediaUrl(item["media:group"]?.["media:thumbnail"]);
  if (groupThumb) return groupThumb;

  return firstImgFromHtml(item["content:encoded"]) || firstImgFromHtml(item.content);
}

function itemLink(item: { link?: string; id?: string; guid?: string }): string | null {
  const link = item.link || item.id || item.guid;
  if (!link) return null;
  try {
    return new URL(link).toString();
  } catch {
    return null;
  }
}

export type FeedUpdateResult = {
  feedId: number;
  feedName: string;
  fetched: number;
  inserted: number;
  error?: string;
};

export async function updateAllFeeds(): Promise<FeedUpdateResult[]> {
  const allFeeds = await db.select().from(feeds);
  const settled = await Promise.allSettled(allFeeds.map((feed) => updateFeed(feed.id, feed.name, feed.feedUrl)));

  return settled.map((result, index) => {
    const feed = allFeeds[index];
    if (result.status === "fulfilled") return result.value;
    return {
      feedId: feed.id,
      feedName: feed.name,
      fetched: 0,
      inserted: 0,
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  });
}

async function updateFeed(feedId: number, feedName: string, feedUrl: string): Promise<FeedUpdateResult> {
  const parsed = await parser.parseURL(feedUrl);
  const items = parsed.items ?? [];
  let inserted = 0;

  for (const item of items) {
    const url = itemLink(item);
    const title = item.title?.trim();
    if (!url || !title) continue;

    const publishedAt = item.isoDate
      ? new Date(item.isoDate)
      : item.pubDate
        ? new Date(item.pubDate)
        : null;

    const values = {
      feedId,
      title,
      url,
      synopsis: synopsisFromItem(item),
      imageUrl: imageFromItem(item),
      publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
    };

    const result = await db
      .insert(feedItems)
      .values(values)
      .onConflictDoNothing({ target: feedItems.url })
      .returning({ id: feedItems.id });

    if (result.length > 0) inserted += 1;
  }

  return {
    feedId,
    feedName,
    fetched: items.length,
    inserted,
  };
}
