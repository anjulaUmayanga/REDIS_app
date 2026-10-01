import type { Article, ArticleInput, ArticleSort, Author } from "@/lib/types";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status = 0, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type CacheEnvelope<T> = {
  cache?: "HIT" | "MISS";
  results?: T;
  article?: T;
  author?: T;
};

type RawArticle = {
  id?: string | number;
  title?: string;
  author?: string;
  date?: string;
  excerpt?: string;
  body?: unknown;
  views?: number | string;
};

function getBaseUrl(): string {
  const base = import.meta.env["VITE_API_BASE_URL"]?.trim();
  if (!base) {
    throw new ApiError(
      "VITE_API_BASE_URL is missing. Add it to Frontend/.env (see .env.example).",
      0,
    );
  }
  return base.replace(/\/$/, "");
}

function normalizeArticle(raw: RawArticle): Article {
  const body = Array.isArray(raw.body)
    ? raw.body.map(String)
    : typeof raw.body === "string"
      ? [raw.body]
      : [];

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    author: String(raw.author ?? ""),
    date: String(raw.date ?? "").slice(0, 10),
    excerpt: String(raw.excerpt ?? ""),
    body,
    views: Number(raw.views ?? 0) || 0,
  };
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 12000,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });

    if (res.status === 204) {
      return undefined as T;
    }

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new ApiError("Server returned invalid JSON.", res.status, text);
      }
    }

    if (!res.ok) {
      const message =
        typeof data === "object" && data && "detail" in data
          ? String((data as { detail: unknown }).detail)
          : res.status === 404
            ? "Not found."
            : `Request failed (${res.status}).`;
      throw new ApiError(message, res.status, data);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out. Is the backend running?", 0);
    }
    throw new ApiError(
      "Cannot reach the API. Check VITE_API_BASE_URL and that Django is running.",
      0,
      err,
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchArticles(sort: ArticleSort = "newest"): Promise<{
  articles: Article[];
  cache: string | null;
}> {
  const data = await request<CacheEnvelope<RawArticle[]>>(
    `/articles/?sort=${encodeURIComponent(sort)}`,
  );
  const rows = Array.isArray(data.results) ? data.results : [];
  return {
    cache: data.cache ?? null,
    articles: rows.map((row) => normalizeArticle(row)),
  };
}

export async function fetchTrending(): Promise<{
  articles: Article[];
  cache: string | null;
}> {
  const data = await request<CacheEnvelope<RawArticle[]>>("/articles/trending/");
  const rows = Array.isArray(data.results) ? data.results : [];
  return {
    cache: data.cache ?? null,
    articles: rows.map((row) => normalizeArticle(row)),
  };
}

export async function fetchArticle(id: string): Promise<{
  article: Article;
  cache: string | null;
}> {
  if (!id || Number.isNaN(Number(id))) {
    throw new ApiError("Invalid article id.", 400);
  }
  const data = await request<CacheEnvelope<RawArticle>>(
    `/articles/${encodeURIComponent(id)}/`,
  );
  if (!data.article) {
    throw new ApiError("Article payload missing.", 500);
  }
  return {
    cache: data.cache ?? null,
    article: normalizeArticle(data.article),
  };
}

export async function fetchAuthor(name: string): Promise<{
  author: Author & { articles: Article[] };
  cache: string | null;
}> {
  const decoded = decodeURIComponent(name).trim();
  if (!decoded) {
    throw new ApiError("Author name is required.", 400);
  }

  const data = await request<
    CacheEnvelope<{
      name: string;
      bio: string;
      articles?: RawArticle[];
    }>
  >(`/authors/${encodeURIComponent(decoded)}/`);

  if (!data.author) {
    throw new ApiError("Author payload missing.", 500);
  }

  return {
    cache: data.cache ?? null,
    author: {
      name: data.author.name,
      bio: data.author.bio ?? "",
      articles: (data.author.articles ?? []).map((row) => normalizeArticle(row)),
    },
  };
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  validateArticleInput(input);
  const raw = await request<RawArticle>("/articles/", {
    method: "POST",
    body: JSON.stringify(payloadFromInput(input)),
  });
  return normalizeArticle(raw);
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>,
): Promise<Article> {
  if (!id || Number.isNaN(Number(id))) {
    throw new ApiError("Invalid article id.", 400);
  }
  const raw = await request<RawArticle>(`/articles/${encodeURIComponent(id)}/`, {
    method: "PATCH",
    body: JSON.stringify(payloadFromInput(input)),
  });
  return normalizeArticle(raw);
}

export async function deleteArticle(id: string): Promise<void> {
  if (!id || Number.isNaN(Number(id))) {
    throw new ApiError("Invalid article id.", 400);
  }
  await request<void>(`/articles/${encodeURIComponent(id)}/`, {
    method: "DELETE",
  });
}

function payloadFromInput(input: Partial<ArticleInput>) {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload["title"] = input.title.trim();
  if (input.author !== undefined) payload["author"] = input.author.trim();
  if (input.date !== undefined) payload["date"] = input.date;
  if (input.excerpt !== undefined) payload["excerpt"] = input.excerpt;
  if (input.body !== undefined) payload["body"] = input.body;
  if (input.views !== undefined) payload["views"] = input.views;
  if (payload["date"] === undefined && input.title !== undefined) {
    payload["date"] = new Date().toISOString().slice(0, 10);
  }
  if (payload["excerpt"] === undefined && input.body) {
    const first = input.body[0] ?? "";
    payload["excerpt"] = first.length > 160 ? `${first.slice(0, 157)}…` : first;
  }
  return payload;
}

function validateArticleInput(input: ArticleInput) {
  if (!input.title.trim()) {
    throw new ApiError("Title is required.", 400);
  }
  if (!input.author.trim()) {
    throw new ApiError("Author is required.", 400);
  }
  if (input.body.length === 0) {
    throw new ApiError("Body cannot be empty.", 400);
  }
}

export const queryKeys = {
  articles: (sort: ArticleSort) => ["articles", sort] as const,
  trending: ["articles", "trending"] as const,
  article: (id: string) => ["article", id] as const,
  author: (name: string) => ["author", name] as const,
};
