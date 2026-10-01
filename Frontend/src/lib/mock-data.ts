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

export const authors: Author[] = [
  {
    name: "Maya Chen",
    bio: "Maya writes about design systems, front-end craft, and the small details that make interfaces feel effortless. She has spent a decade building products and still believes good typography fixes most problems.",
  },
  {
    name: "Jonas Rivera",
    bio: "Jonas covers software architecture and developer culture. He likes boring technology, clear writing, and long walks between refactors.",
  },
  {
    name: "Priya Nair",
    bio: "Priya is a product thinker who writes about how teams ship, why they stall, and what good process actually looks like in practice.",
  },
];

const lorem = (topic: string): string[] => [
  `${topic} — it's a subject that rewards a second look. Most people encounter it in passing, file it under "probably fine," and move on. But the details matter more than the headline suggests, and the details are where the interesting decisions live.`,
  `Consider the simplest version first. Strip away the tooling, the frameworks, the opinions of people on the internet, and ask what the problem actually is. Nine times out of ten, the core problem is smaller than the solution that was built for it. The extra machinery exists to serve edge cases, real or imagined.`,
  `There's a temptation to optimize early. To design for scale that hasn't arrived, for users who haven't shown up, for failure modes that exist only in conference talks. Resist it. Build the thing that works for the case in front of you, and keep the seams clean so you can change your mind later.`,
  `None of this is to say that rigor doesn't matter. It does. But rigor applied to the wrong question is just expensive confusion. The best practitioners share a habit: they spend more time than anyone else deciding what not to do, and then they do the remaining few things with total commitment.`,
  `In the end, craft is mostly attention. Attention to the words, the edges, the defaults, the error states nobody checks. The people who do this well aren't smarter; they're just still looking after everyone else looked away. That's the whole secret, and it's not really a secret at all.`,
];

export const articles: Article[] = [
  {
    id: "1",
    title: "The Quiet Power of Good Defaults",
    author: "Maya Chen",
    date: "2026-09-10",
    excerpt:
      "Most users never change a single setting. What you ship as the default is the product.",
    body: lorem("Good defaults"),
    views: 4821,
  },
  {
    id: "2",
    title: "Why Your Side Project Keeps Dying in Week Three",
    author: "Jonas Rivera",
    date: "2026-09-08",
    excerpt:
      "It's not motivation. It's scope, feedback loops, and one bad habit almost everyone has.",
    body: lorem("Side projects"),
    views: 9214,
  },
  {
    id: "3",
    title: "Typography Is the Interface",
    author: "Maya Chen",
    date: "2026-09-05",
    excerpt:
      "Before color, before layout, before animation — users read. A case for treating text as the primary UI.",
    body: lorem("Typography"),
    views: 6402,
  },
  {
    id: "4",
    title: "Boring Technology, Revisited",
    author: "Jonas Rivera",
    date: "2026-09-01",
    excerpt:
      "The tools nobody tweets about are still running most of the internet. That's not an accident.",
    body: lorem("Boring technology"),
    views: 12087,
  },
  {
    id: "5",
    title: "Meetings Are a Design Problem",
    author: "Priya Nair",
    date: "2026-08-28",
    excerpt:
      "Bad meetings aren't a culture issue. They're an interface with no constraints and no error states.",
    body: lorem("Meetings"),
    views: 5733,
  },
  {
    id: "6",
    title: "The Two-Hour Rule for Learning Anything Technical",
    author: "Priya Nair",
    date: "2026-08-22",
    excerpt:
      "Depth beats breadth early. A simple framework for deciding when to go deep and when to move on.",
    body: lorem("Learning"),
    views: 3150,
  },
  {
    id: "7",
    title: "Delete More Code",
    author: "Jonas Rivera",
    date: "2026-08-15",
    excerpt:
      "Every line you ship is a liability. The best refactor is often a deletion.",
    body: lorem("Deleting code"),
    views: 7489,
  },
  {
    id: "8",
    title: "Designing the Empty State",
    author: "Maya Chen",
    date: "2026-08-10",
    excerpt:
      "The first screen a new user sees is the one with nothing on it. Most teams design it last, if at all.",
    body: lorem("Empty states"),
    views: 2874,
  },
];

export function getArticle(id: string): Article | undefined {
  return articles.find((a) => a.id === id);
}

export function getAuthor(name: string): Author | undefined {
  return authors.find((a) => a.name === name);
}

export function getArticlesByAuthor(name: string): Article[] {
  return articles.filter((a) => a.author === name);
}

export function formatViews(views: number): string {
  return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : String(views);
}

export function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
