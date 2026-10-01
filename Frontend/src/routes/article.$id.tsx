import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ErrorBlock, LoadingBlock, PageShell } from "@/components/QueryState";
import { formatDate } from "@/lib/types";
import { ApiError, deleteArticle, fetchArticle, queryKeys } from "@/service/api";

export const Route = createFileRoute("/article/$id")({
  head: () => ({
    meta: [
      { title: "Article — The Draft" },
      { name: "description", content: "Read this article on The Draft." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.article(id),
    queryFn: () => fetchArticle(id),
    retry: (count, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return count < 2;
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteArticle(id),
    onSuccess: async () => {
      toast.success("Article deleted");
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      navigate({ to: "/" });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    },
  });

  if (isError && error instanceof ApiError && error.status === 404) {
    throw notFound();
  }

  const article = data?.article;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        {isLoading ? <LoadingBlock label="Loading article…" /> : null}
        {isError ? <ErrorBlock error={error} onRetry={() => refetch()} /> : null}

        {article ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                ← All articles
              </Link>
              <div className="flex gap-2">
                <Link
                  to="/article/$id/edit"
                  params={{ id: article.id }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-xs transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (!window.confirm("Delete this article? This cannot be undone.")) return;
                    remove.mutate();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-semibold text-destructive shadow-xs transition-colors hover:border-destructive/30 hover:bg-destructive/10 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {remove.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>

            <article className="mt-10">
              <h1 className="font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <Link
                  to="/author/$name"
                  params={{ name: article.author }}
                  className="font-semibold text-primary hover:text-primary-hover"
                >
                  {article.author}
                </Link>
                <span aria-hidden>·</span>
                <span>{formatDate(article.date)}</span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">
                  <Eye className="h-4 w-4" />
                  {article.views.toLocaleString()} views
                </span>
                {data?.cache ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="text-xs font-medium text-primary">Redis {data.cache}</span>
                  </>
                ) : null}
              </div>

              <div className="mt-10 space-y-7 border-t border-border pt-10">
                {article.body.length === 0 ? (
                  <p className="text-muted-foreground">This article has no body yet.</p>
                ) : (
                  article.body.map((paragraph, i) => (
                    <p key={i} className="text-lg leading-8 text-foreground/90">
                      {paragraph}
                    </p>
                  ))
                )}
              </div>
            </article>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}
