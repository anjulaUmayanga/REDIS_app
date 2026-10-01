export interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string[];
  views: number;
}

export interface Author {
  name: string;
  bio: string;
}

export type ArticleSort = "newest" | "most_viewed";

export interface ArticleInput {
  title: string;
  author: string;
  date?: string;
  excerpt?: string;
  body: string[];
  views?: number;
}

export function formatViews(views: number): string {
  return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : String(views);
}

export function formatDate(date: string): string {
  const parsed = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Split form textarea into paragraphs for the API body array. */
export function bodyFromText(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function excerptFromBody(body: string[]): string {
  const first = body[0] ?? "";
  return first.length > 160 ? `${first.slice(0, 157)}…` : first;
}
