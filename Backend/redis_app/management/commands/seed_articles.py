from datetime import date

from django.core.management.base import BaseCommand

from redis_app.models import Article, Author


def lorem(topic: str) -> list[str]:
    return [
        f'{topic} — it\'s a subject that rewards a second look. Most people encounter it in passing, file it under "probably fine," and move on. But the details matter more than the headline suggests, and the details are where the interesting decisions live.',
        "Consider the simplest version first. Strip away the tooling, the frameworks, the opinions of people on the internet, and ask what the problem actually is. Nine times out of ten, the core problem is smaller than the solution that was built for it. The extra machinery exists to serve edge cases, real or imagined.",
        "There's a temptation to optimize early. To design for scale that hasn't arrived, for users who haven't shown up, for failure modes that exist only in conference talks. Resist it. Build the thing that works for the case in front of you, and keep the seams clean so you can change your mind later.",
        "None of this is to say that rigor doesn't matter. It does. But rigor applied to the wrong question is just expensive confusion. The best practitioners share a habit: they spend more time than anyone else deciding what not to do, and then they do the remaining few things with total commitment.",
        "In the end, craft is mostly attention. Attention to the words, the edges, the defaults, the error states nobody checks. The people who do this well aren't smarter; they're just still looking after everyone else looked away. That's the whole secret, and it's not really a secret at all.",
    ]


AUTHORS = [
    {
        "name": "Maya Chen",
        "bio": "Maya writes about design systems, front-end craft, and the small details that make interfaces feel effortless. She has spent a decade building products and still believes good typography fixes most problems.",
    },
    {
        "name": "Jonas Rivera",
        "bio": "Jonas covers software architecture and developer culture. He likes boring technology, clear writing, and long walks between refactors.",
    },
    {
        "name": "Priya Nair",
        "bio": "Priya is a product thinker who writes about how teams ship, why they stall, and what good process actually looks like in practice.",
    },
]

ARTICLES = [
    {
        "title": "The Quiet Power of Good Defaults",
        "author": "Maya Chen",
        "date": date(2026, 9, 10),
        "excerpt": "Most users never change a single setting. What you ship as the default is the product.",
        "body": lorem("Good defaults"),
        "views": 4821,
    },
    {
        "title": "Why Your Side Project Keeps Dying in Week Three",
        "author": "Jonas Rivera",
        "date": date(2026, 9, 8),
        "excerpt": "It's not motivation. It's scope, feedback loops, and one bad habit almost everyone has.",
        "body": lorem("Side projects"),
        "views": 9214,
    },
    {
        "title": "Typography Is the Interface",
        "author": "Maya Chen",
        "date": date(2026, 9, 5),
        "excerpt": "Before color, before layout, before animation — users read. A case for treating text as the primary UI.",
        "body": lorem("Typography"),
        "views": 6402,
    },
    {
        "title": "Boring Technology, Revisited",
        "author": "Jonas Rivera",
        "date": date(2026, 9, 1),
        "excerpt": "The tools nobody tweets about are still running most of the internet. That's not an accident.",
        "body": lorem("Boring technology"),
        "views": 12087,
    },
    {
        "title": "Meetings Are a Design Problem",
        "author": "Priya Nair",
        "date": date(2026, 8, 28),
        "excerpt": "Bad meetings aren't a culture issue. They're an interface with no constraints and no error states.",
        "body": lorem("Meetings"),
        "views": 5733,
    },
    {
        "title": "The Two-Hour Rule for Learning Anything Technical",
        "author": "Priya Nair",
        "date": date(2026, 8, 22),
        "excerpt": "Depth beats breadth early. A simple framework for deciding when to go deep and when to move on.",
        "body": lorem("Learning"),
        "views": 3150,
    },
    {
        "title": "Delete More Code",
        "author": "Jonas Rivera",
        "date": date(2026, 8, 15),
        "excerpt": "Every line you ship is a liability. The best refactor is often a deletion.",
        "body": lorem("Deleting code"),
        "views": 7489,
    },
    {
        "title": "Designing the Empty State",
        "author": "Maya Chen",
        "date": date(2026, 8, 10),
        "excerpt": "The first screen a new user sees is the one with nothing on it. Most teams design it last, if at all.",
        "body": lorem("Empty states"),
        "views": 2874,
    },
]


class Command(BaseCommand):
    help = "Seed authors and articles matching the frontend mock data"

    def handle(self, *args, **options):
        for a in AUTHORS:
            Author.objects.update_or_create(name=a["name"], defaults={"bio": a["bio"]})

        created = 0
        for row in ARTICLES:
            obj, was_created = Article.objects.update_or_create(
                title=row["title"],
                defaults=row,
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(AUTHORS)} authors, {Article.objects.count()} articles "
                f"({created} newly created)."
            )
        )
