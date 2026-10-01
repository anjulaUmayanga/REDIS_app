import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageShell } from "@/components/QueryState";
import { formatViews } from "@/lib/types";
import { fetchTrending, queryKeys } from "@/service/api";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending — The Draft" },
      { name: "description", content: "The most-read articles on The Draft right now." },
      { property: "og:title", content: "Trending — The Draft" },
      { property: "og:description", content: "The most-read articles on The Draft right now." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.trending,
    queryFn: fetchTrending,
  });

  const top = data?.articles ?? [];
  const rankStyles = [
    "border-rank-gold/40 bg-rank-gold-soft text-rank-gold",
    "border-rank-silver/40 bg-rank-silver-soft text-rank-silver",
    "border-rank-bronze/40 bg-rank-bronze-soft text-rank-bronze",
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Trending</h1>
        <p className="mt-2 text-base text-muted-foreground">
          The most-read articles right now.
          {data?.cache ? (
            <span className="ml-2 text-xs font-medium text-primary">Redis {data.cache}</span>
          ) : null}
        </p>

        <div className="mt-10">
          {isLoading ? <LoadingBlock label="Loading trending…" /> : null}
          {isError ? <ErrorBlock error={error} onRetry={() => refetch()} /> : null}
          {!isLoading && !isError && top.length === 0 ? (
            <EmptyBlock title="Nothing trending yet" description="Publish articles to fill this list." />
          ) : null}
          {!isLoading && !isError && top.length > 0 ? (
            <ol className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
              {top.map((article, i) => (
                <li key={article.id} className="border-b border-border last:border-b-0">
                  <Link
                    to="/article/$id"
                    params={{ id: article.id }}
                    className="group flex items-center gap-4 px-4 py-5 transition-colors hover:bg-accent/60 sm:gap-5 sm:px-6"
                  >
                    <span
                      className={
                        i < 3
                          ? `flex size-9 shrink-0 items-center justify-center rounded-full border font-heading text-sm font-extrabold tabular-nums ${rankStyles[i]}`
                          : "flex size-9 shrink-0 items-center justify-center font-heading text-lg font-bold tabular-nums text-muted-foreground/60"
                      }
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading font-bold text-card-foreground transition-colors group-hover:text-primary">
                        {article.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {article.author}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-sm font-semibold text-primary">
                      <Eye className="h-4 w-4" />
                      {formatViews(article.views)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
