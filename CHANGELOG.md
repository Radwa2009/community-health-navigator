# Changelog

## v2 — Selection-committee revision (July 6, 2026)

### Added
- **About & pilot plan view** (new navigation item) with four blocks:
  - *About this project* — Radwa Gebreil, Public Health & Nonprofit AI Workflow Builder, MPH (UC Berkeley), the operations experience behind the design, built with Claude as a product-thinking and coding partner, designed as a Claude Corps portfolio project. **Why:** reviewers should meet the builder and the positioning inside the product itself, not only in the README.
  - *Prototype scope* — states plainly that this is a frontend demo with fictional, de-identified data, and lists what production would require (approved backend, authentication, role-based access, audit logs, approved privacy policies, staff training). **Why:** knowing a tool's limits is part of good judgment; saying so in the UI demonstrates it.
  - *Pilot plan & success metrics* — two-week pilot with one team: observe first, train 2–3 staff, run in parallel, collect feedback, revise based on real behavior; measured by overdue follow-ups, weekly-report time, intake-note completeness, and staff usability feedback. **Why:** program-evaluation thinking is the strongest evidence of public health training — the tool now ships with its own evaluation design.
  - *Demo walkthrough* — the 5-step reviewer path (dashboard → high-priority case → missing info → copy an AI prompt → weekly report). **Why:** committee members have minutes, not hours; the tool now guides its own review.
- **Prototype-scope note on the dashboard**, linking to the About view. **Why:** the scope disclosure should be visible on the first screen, not buried.
- **Seventh AI prompt template: "Review AI output for risk"** — helps staff check an AI draft for invented facts, implied eligibility decisions, sensitive/identifying data, and overconfident tone, ending with questions for staff to resolve. **Why:** teaching staff to audit AI output is the clearest demonstration of practical AI use without unsafe automation.
- **CHANGELOG.md** (this file).

### Changed
- **AI assistant disclaimer expanded** from one line to the four standing rules, now covering all AI-related features: AI supports staff and does not make decisions; de-identified data only; trained humans make final eligibility and service decisions; bilingual staff verify translations before sending.
- **README rewritten** with: a first-person "Why I built this" section; "Pilot plan" and "Success metrics" sections; "What I would do differently if rebuilding this"; a short "Interview-ready explanation"; and a prominent prototype-not-production note at the top.
- **PORTFOLIO_NOTES.md updated** with a LinkedIn post draft and new talking points on evaluation and rebuild reflections.
- **CSS additions** for the new About view, scope notes, and expanded disclaimer; pilot columns stack on mobile.

### Verified
- All navigation buttons map to existing views; every element ID referenced in `app.js` exists in `index.html`.
- JavaScript passes syntax checks; no console-breaking references.
- Multi-file ZIP structure works as `index.html` + `css/styles.css` + `js/data.js` + `js/app.js` with correct relative paths.
- Single-file version rebuilt from the same source so both stay identical in behavior.

## v1 — Initial prototype

Dashboard, family intake form with required consent, case list with search/filters, case detail drawer with missing-information checklist and staff-review next steps, AI assistant panel with six prompt templates (no API), weekly impact report generator, in-app staff guide & handoff documentation, fictional demo data with a localStorage adapter designed for a later Firebase swap.
