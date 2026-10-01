import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageShell } from "@/components/QueryState";
import type { ArticleSort } from "@/lib/types";
import { fetchArticles, queryKeys } from "@/service/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Draft — Essays on craft, code, and work" },
      { name: "description", content: "A small collection of essays on design, software, and working well." },
      { property: "og:title", content: "The Draft — Essays on craft, code, and work" },
      { property: "og:description", content: "A small collection of essays on design, software, and working well." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

type SortMode = "newest" | "mostViewed";

function HomePage() {
  const [sort, setSort] = useState<SortMode>("newest");
  const apiSort: ArticleSort = sort === "newest" ? "newest" : "most_viewed";

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.articles(apiSort),
    queryFn: () => fetchArticles(apiSort),
  });

  const articles = data?.articles ?? [];

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Latest articles
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Essays on design, software, and working well.
            {data?.cache ? (
              <span className="ml-2 text-xs font-medium text-primary">Redis {data.cache}</span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Sort articles">
          {(
            [
              { key: "newest", label: "Newest" },
              { key: "mostViewed", label: "Most Viewed" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={
                sort === key
                  ? "rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                  : "rounded-md border border-border bg-card px-3.5 py-2 text-sm font-semibold text-muted-foreground shadow-xs transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {isLoading ? <LoadingBlock label="Loading articles…" /> : null}
        {isError ? <ErrorBlock error={error} onRetry={() => refetch()} /> : null}
        {!isLoading && !isError && articles.length === 0 ? (
          <EmptyBlock
            title="No articles yet"
            description="Create one from the Write page, or seed the backend."
          />
        ) : null}
        {!isLoading && !isError && articles.length > 0 ? (
          <div className={`grid gap-6 sm:grid-cols-2 ${isFetching ? "opacity-70" : ""}`}>
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
