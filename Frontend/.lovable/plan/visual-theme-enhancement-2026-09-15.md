# Visual theme enhancement

## Scope
- Add a sun/moon theme control to the shared navigation.
- Keep the selected light or dark theme while navigating during the browser session.
- Refresh semantic colors for warm off-white light mode and deep charcoal dark mode with an indigo accent.
- Refine cards, buttons, typography, spacing, and hover/focus states across existing pages.
- Give the top three trending entries distinct gold, silver, and bronze treatments.
- Preserve all existing routes, article data, and page behavior.

## Technical details
- Initialize the theme before page paint, store it in session storage, and toggle the root `dark` class.
- Update global Tailwind theme tokens and font families; reuse those tokens throughout page styles.
- Validate the result in desktop and mobile-sized browser views, including theme persistence after navigation.
