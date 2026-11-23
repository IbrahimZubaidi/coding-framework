# Figma Make — Design Prompt for IMF AutoML

Paste everything between the triple-dashes into Figma Make when starting a new design.

---

## App overview

[FILL IN: describe what the app does, who uses it, and the main user flows]

Example:
> IMF AutoML is a web platform that lets data scientists upload datasets, run automated machine learning experiments, compare trained models, and download predictions — without writing code.

---

## Pages to design

[FILL IN: list every page with a one-line description]

Example:
```
Public:
- Home          — landing page, hero + features + how it works + CTA
- Login         — email + password form
- Register      — name + email + password form

Dashboard (authenticated, sidebar):
- Dashboard     — KPI cards + recent experiments + quick actions
- Datasets      — table of uploaded datasets, upload button
- Dataset       — single dataset detail: preview, schema, stats
- Experiments   — table of experiments with status chips
- Experiment    — single experiment: config, progress, results
- Models        — table of trained models with accuracy metrics
- Model         — single model detail: metrics, charts, download
- Predictions   — run prediction form + history table
- Profile       — account settings form
```

---

## Design instructions for Figma Make

### Brand colors
- Primary (dark navy):  `#05223A`
- Secondary (orange):   `#F18020`
- Background light:     `#F8F4EF`
- Card background:      `#FFFFFF`
- Text primary:         `#05223A`
- Text muted:           `#6A7282`
- Success:              `#00C950`
- Warning:              `#FE9A00`
- Danger:               `#FB2C36`

### Typography
- Font family: **Nunito** (Google Fonts)
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 36 / 48px
- Weights used: 400 regular, 500 medium, 600 semibold, 700 bold, 800 extrabold
- Page titles: 24px extrabold
- Section subtitles: 14px muted
- Body text: 16px regular
- Labels / captions: 12–14px

### Spacing
Use this scale consistently: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px

### Border radius
- Inputs, buttons, small cards: 12px
- Cards: 16px
- Large sections: 24px
- Pills / tags / chips: 999px

### Layout
- Fixed top navbar: 65px tall, dark navy background
- Dashboard pages have a fixed left sidebar: 260px wide (collapses to 65px on tablet)
- Page content padding: 32px horizontal on desktop
- Card padding: 24px
- Grid gap: 16–24px

### Shadows
- Card: `0 10px 30px rgba(15, 23, 42, 0.08)`
- Card hover: `0 16px 40px rgba(15, 23, 42, 0.12)`

### Buttons
- Primary (filled orange):  bg `#F18020`, white text, radius 12px
- Dark (filled navy):       bg `#05223A`, white text, radius 12px
- Outline:                  white bg, orange border, dark text
- Ghost:                    transparent bg, orange text
- Danger:                   bg `#E7000B`, white text
- Heights: small 36px / default 44px / large 52px
- Always include an icon OR label, never icon-only without a tooltip

### Forms
- Input height: 46px
- Input background: `#F9FAFB`
- Input border: `2px solid #E5E7EB`
- Input border-radius: 12px
- Label: 14px semibold, above the input
- Validation error: 12px red text below input
- Password fields always have a show/hide toggle on the right

### Navigation
- **Public navbar**: logo left, nav links centered, auth buttons right. On mobile collapses to hamburger.
- **Dashboard navbar**: right-aligned only — theme toggle + notifications bell + user avatar dropdown. No logo (sidebar has it).
- **Sidebar**: logo at top, nav items with icon + label, user info at bottom. Collapses to icon-only on tablet, becomes bottom tab bar on mobile.

### Hero sections (public pages)
- Dark navy background (`#05223A`) with subtle grid-line pattern overlay
- White headline text, orange accent on key words
- Subtitle text at 70% white opacity
- Optional: right-side image or KPI stats card

### Data tables
- Toolbar row: search input (pill shape) on the left, filter chips in the middle, action buttons on the right
- Filter chips: pill shape, muted by default, dark navy when active
- Table header: 12px semibold muted text, `#F8F4EF` background
- Table rows: white background, subtle bottom border, hover state `#F9FAFB`
- Status badges: pill shape with colored bg (green approved / amber pending / red rejected)
- Row action buttons: icon-only ghost buttons, muted color, darker on hover
- Pagination below table, right-aligned, orange active page

### KPI cards
- White card with subtle shadow
- 44×44px colored icon square (top-left)
- Large extrabold value below
- Small muted label caption
- Optional small colored trend hint at bottom

### Dashboard sidebar nav items
- Icon + label, full-width, rounded 10px
- Default: 65% white opacity
- Hover: white semi-transparent background
- Active: orange background, full white opacity

### Dark mode
Design light mode only. Dark mode is handled in code via `[data-theme="dark"]` — no need to design it in Figma.

### Responsive breakpoints
- Desktop: 1200px+ (full layout)
- Tablet: 768px–1199px (collapsed sidebar, adjusted grids)
- Mobile: <768px (bottom tab bar, single-column, stacked sections)

### Do NOT design
- Loading spinners (handled by code)
- Toast notifications (handled by code)
- Confirm modals (handled by code)
- Dropdown menus content (handled by code)
These are injected programmatically and don't need Figma frames.

### Code output instructions for Figma Make
Generate output as: **plain HTML + CSS + vanilla JavaScript**
- No React, no Vue, no Next.js, no TypeScript
- No Tailwind — use plain CSS with class names
- Use Bootstrap 5 for grid and utility classes where helpful
- Class names in kebab-case
- Each page = one HTML file
- Keep JS minimal — focus on the visual design, not interactivity
- The generated code will be replaced during implementation; it is only used as a visual reference

---

## Notes for the developer (Claude)

When I share the Figma URL:
1. Read all screens first before planning anything
2. Identify every reusable component across pages (cards, table rows, stat bars, form layouts, etc.)
3. Map each component to an existing one in `components/` — only plan new components for things that don't exist yet
4. Define the full API endpoint list needed across all pages
5. Identify the sidebar nav items and footer links from the designs
6. Plan build order: shared components first, then pages in dependency order
7. Flag any design pattern that would be expensive to implement in vanilla JS so we can simplify before building
