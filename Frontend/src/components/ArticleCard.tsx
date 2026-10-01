import { Link } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { formatDate, formatViews, type Article } from "@/lib/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to="/article/$id"
      params={{ id: article.id }}
      className="group block rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-heading text-lg font-bold leading-snug text-card-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h2>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
          <Eye className="h-3.5 w-3.5" />
          {formatViews(article.views)}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {article.excerpt}
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{article.author}</span>
        <span aria-hidden>·</span>
        <span>{formatDate(article.date)}</span>
      </div>
    </Link>
  );
}
