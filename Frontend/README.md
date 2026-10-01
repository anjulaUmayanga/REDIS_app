# Simple Blog Showcase

Build a simple blog/article platform frontend with dummy/mock data (no backend, no API calls — just hardcoded sample data in the code).

Pages needed:

1. Home / Article List Page

   - Grid or list of ~8 sample articles, each with title, author, short excerpt, and a view count badge

   - Sort/filter buttons at top: "Newest" and "Most Viewed" (just reorder the dummy array on click, no real logic needed)

   - Clicking an article navigates to its detail page

2. Article Detail Page

   - Full title, author, publish date, full body text (dummy paragraph text)

   - A view count number displayed prominently (static dummy number)

   - "Edit" and "Delete" buttons (UI only, no real functionality needed)

3. Trending Page

   - Ranked list (1, 2, 3...) of top 5 articles by views, with view count shown next to each

   - Simple, clean ranked list style, like a leaderboard

4. Create/Edit Article Page

   - Simple form: title, author, body text fields

   - "Save" button (no real submission needed, just UI)

5. Author Profile Page (optional, simple)

   - Author name, short bio, list of their articles (just filter dummy data by author name)

Design style: clean, minimal, modern blog aesthetic. Card-based layout for lists. Good typography for readability on the article detail page. Use a simple color palette, nothing flashy. Mobile responsive.

Use React with React Router for navigation between pages. Store all dummy data in a single mock data file (array of article objects) that all pages import from — do not connect to any real backend or API.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mock-muses.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/12529721-5c3b-44e4-9878-f8c350106000).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
