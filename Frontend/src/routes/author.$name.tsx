import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageShell } from "@/components/QueryState";
import { ApiError, fetchAuthor, queryKeys } from "@/service/api";

export const Route = createFileRoute("/author/$name")({
  head: ({ params }) => ({
    meta: [
      { title: `${decodeURIComponent(params.name)} — The Draft` },
      { name: "description", content: "Author profile on The Draft." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthorPage,
});

function AuthorPage() {
  const { name } = Route.useParams();
  const authorName = decodeURIComponent(name);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.author(authorName),
    queryFn: () => fetchAuthor(authorName),
    retry: (count, err) => {
      if (err instanceof ApiError && err.status === 404) return false;
      return count < 2;
    },
  });

  if (isError && error instanceof ApiError && error.status === 404) {
    throw notFound();
  }

  const author = data?.author;
  const articles = author?.articles ?? [];
  const initials = (author?.name ?? authorName)
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <PageShell>
      {isLoading ? <LoadingBlock label="Loading author…" /> : null}
      {isError ? <ErrorBlock error={error} onRetry={() => refetch()} /> : null}

      {author ? (
        <>
          <div className="flex items-start gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xl font-bold text-primary-foreground shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                {author.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {author.bio || "No bio yet."}
              </p>
              {data?.cache ? (
                <p className="mt-2 text-xs font-medium text-primary">Redis {data.cache}</p>
              ) : null}
            </div>
          </div>

          <h2 className="mt-12 font-heading text-xl font-bold text-foreground">
            Articles by {author.name.split(" ")[0]}
          </h2>
          <div className="mt-6">
            {articles.length === 0 ? (
              <EmptyBlock
                title="No articles"
                description="This author hasn’t published anything yet."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
