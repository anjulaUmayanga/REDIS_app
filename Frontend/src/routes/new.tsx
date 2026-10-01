import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/QueryState";
import { bodyFromText, excerptFromBody } from "@/lib/types";
import { ApiError, createArticle, updateArticle } from "@/service/api";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "Write a new article — The Draft" },
      { name: "description", content: "Draft a new article on The Draft." },
      { property: "og:title", content: "Write a new article — The Draft" },
      { property: "og:description", content: "Draft a new article on The Draft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewArticlePage,
});

const inputClass =
  "w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground shadow-xs transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-ring/25 disabled:opacity-60";

export function ArticleForm({
  defaultTitle = "",
  defaultAuthor = "",
  defaultBody = "",
  submitLabel,
  mode = "create",
  articleId,
}: {
  defaultTitle?: string;
  defaultAuthor?: string;
  defaultBody?: string;
  submitLabel: string;
  mode?: "create" | "edit";
  articleId?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(defaultTitle);
  const [author, setAuthor] = useState(defaultAuthor);
  const [bodyText, setBodyText] = useState(defaultBody);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const body = bodyFromText(bodyText);
      if (!title.trim()) throw new ApiError("Title is required.", 400);
      if (!author.trim()) throw new ApiError("Author is required.", 400);
      if (body.length === 0) throw new ApiError("Body cannot be empty.", 400);

      const payload = {
        title: title.trim(),
        author: author.trim(),
        body,
        excerpt: excerptFromBody(body),
        date: new Date().toISOString().slice(0, 10),
      };

      if (mode === "edit") {
        if (!articleId) throw new ApiError("Missing article id.", 400);
        return updateArticle(articleId, payload);
      }
      return createArticle(payload);
    },
    onSuccess: async (article) => {
      setFieldError(null);
      toast.success(mode === "edit" ? "Article updated" : "Article created");
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      await queryClient.invalidateQueries({ queryKey: ["article", article.id] });
      navigate({ to: "/article/$id", params: { id: article.id } });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Save failed";
      setFieldError(message);
      toast.error(message);
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (save.isPending) return;
    save.mutate();
  }

  return (
    <form className="mt-10 space-y-6" onSubmit={onSubmit} noValidate>
      {fieldError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {fieldError}
        </div>
      ) : null}

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your article a title"
          className={inputClass}
          disabled={save.isPending}
          required
        />
      </div>
      <div>
        <label htmlFor="author" className="mb-1.5 block text-sm font-medium text-foreground">
          Author
        </label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name"
          className={inputClass}
          disabled={save.isPending}
          required
        />
      </div>
      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-foreground">
          Body
        </label>
        <textarea
          id="body"
          rows={12}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Write your article here… Separate paragraphs with a blank line."
          className={inputClass}
          disabled={save.isPending}
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function NewArticlePage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
          New article
        </h1>
        <p className="mt-2 text-base text-muted-foreground">Draft something worth reading.</p>
        <ArticleForm submitLabel="Save article" mode="create" />
      </div>
    </PageShell>
  );
}
