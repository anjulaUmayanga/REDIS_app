import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ErrorBlock, LoadingBlock, PageShell } from "@/components/QueryState";
import { ApiError, fetchArticle, queryKeys } from "@/service/api";
import { ArticleForm } from "./new";

export const Route = createFileRoute("/article/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit article — The Draft" },
      { name: "description", content: "Edit an article draft on The Draft." },
      { property: "og:title", content: "Edit article — The Draft" },
      { property: "og:description", content: "Edit an article draft on The Draft." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditArticlePage,
});

function EditArticlePage() {
  const { id } = Route.useParams();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.article(id),
    queryFn: () => fetchArticle(id),
    retry: (count, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return count < 2;
    },
  });

  if (isError && error instanceof ApiError && error.status === 404) {
    throw notFound();
  }

  const article = data?.article;

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
          Edit article
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Changes are saved to MySQL and Redis caches are invalidated.
        </p>

        {isLoading ? <LoadingBlock label="Loading article…" /> : null}
        {isError ? <ErrorBlock error={error} onRetry={() => refetch()} /> : null}

        {article ? (
          <ArticleForm
            key={article.id}
            articleId={article.id}
            mode="edit"
            defaultTitle={article.title}
            defaultAuthor={article.author}
            defaultBody={article.body.join("\n\n")}
            submitLabel="Save changes"
          />
        ) : null}
      </div>
    </PageShell>
  );
}
