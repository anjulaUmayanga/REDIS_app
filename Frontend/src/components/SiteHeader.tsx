import { Link } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <Link to="/" className="font-heading text-xl font-bold text-foreground transition-colors hover:text-primary">
          The Draft
        </Link>
        <nav className="flex items-center gap-1.5 text-sm sm:gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "rounded-md bg-accent px-2.5 py-2 font-semibold text-primary" }}
            inactiveProps={{ className: "rounded-md px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-primary transition-colors" }}
          >
            Articles
          </Link>
          <Link
            to="/trending"
            activeProps={{ className: "rounded-md bg-accent px-2.5 py-2 font-semibold text-primary" }}
            inactiveProps={{ className: "rounded-md px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-primary transition-colors" }}
          >
            Trending
          </Link>
          <Link
            to="/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md"
          >
            <PenLine className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Write</span>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
