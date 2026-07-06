# Community Health Access Navigator

A frontend prototype that helps community health and nonprofit staff manage family intake, track needs and referrals, stay on top of follow-ups, and generate weekly impact reports — with AI positioned strictly as staff support, never as a decision-maker.

**Live demo:** _(add your GitHub Pages link here)_

> **Prototype, not a production system.** This is a frontend demo using fictional, de-identified data, stored only in the browser. A production version would require an approved backend, authentication, role-based access, audit logs, organization-approved privacy policies, and staff training. The app says this on its dashboard and in its About section, because the limits of a tool should be as visible as its features.

---

## Why I built this

I'm Radwa Gebreil — a public health and nonprofit AI workflow builder (MPH, UC Berkeley), not a senior software engineer, and this project reflects that on purpose.

In my work across health coverage navigation, food distribution coordination, and program evaluation, I lived inside the problem this tool addresses. I watched intake details get captured on sticky notes and lost by Friday. I saw follow-ups slip because they existed only in one person's inbox. I spent hours reconstructing monthly numbers from three spreadsheets that disagreed with each other. And I noticed who pays for those gaps: the family whose Medi-Cal renewal deadline passes while their paperwork sits in a pile.

When I learned to work with Claude, my first instinct wasn't "what can AI automate?" — it was "which parts of this workflow are safe and genuinely useful to support with AI, and which parts must stay with trained humans no matter what?" This prototype is my answer, and it's the kind of thinking I'd bring to a Claude Corps host organization.

## The problem

Community health and nonprofit teams often manage family support requests through a mix of paper notes, emails, spreadsheets, and memory. The result: lost intake details, missed follow-ups, documentation that varies by staff member, and impact reporting that takes hours and still undercounts the work.

## Target users

- Community health workers
- Nonprofit program coordinators and case coordinators
- Volunteers doing intake or follow-up
- Program managers who report to leadership and funders

## What I built

A single-page web app (HTML/CSS/JavaScript, no backend required) with realistic fictional demo data. I built this prototype with Claude as a product-thinking and coding partner; I designed the workflow based on my public health and nonprofit operations experience.

## Key features

- **Dashboard** — families served, open cases, follow-ups due, referrals made, food and health-coverage request counts, and a flagged **"Needs human review"** list that surfaces high-urgency or incomplete cases first. A visible prototype-scope note sits right under the header.
- **Family intake form** — case ID/initials (not full names), preferred language, household size, contact method, needs checklist (Medi-Cal, Covered California, CalFresh, food distribution, caregiver support, transportation, housing referral, other), urgency, notes, a required consent checkbox, and a privacy reminder.
- **Case list** — search plus filters by status, need, and urgency, with "missing items" flags on each card.
- **Case detail panel** — family profile, per-need referral status, editable status and follow-up date, a notes timeline, a rule-based **missing information** checklist, and **suggested next steps** explicitly labeled for staff review.
- **AI assistant panel (demo, no API)** — seven copy-ready prompt templates for Claude: summarize notes, identify missing info, draft a follow-up message, report narrative, plain-language eligibility explanation, staff checklist, and **"Review AI output for risk"** — a template that helps staff check whether an AI draft invented facts, made eligibility judgments, included sensitive data, or sounded overconfident. Templates can be pre-filled with a selected de-identified case.
- **Weekly impact report generator** — builds a copyable report from current data: families served, most common needs, follow-ups due, referrals made, cases needing review, and rule-based suggested operational improvements.
- **Staff guide & handoff section** — in-app documentation covering daily use, what data must never be entered, privacy and consent guidelines, a training plan for new staff, and workflow maintenance.
- **About & pilot plan section** — who built the tool, its prototype scope, a two-week pilot plan with success metrics, and a five-step demo walkthrough for reviewers.

## Demo walkthrough (2 minutes)

1. **Start on the Dashboard** — see the "Needs human review" panel surface high-urgency and incomplete cases first.
2. **Open a high-priority case** — the case detail panel slides open with the family profile and referral status.
3. **Review the missing information checklist** — the tool flags gaps like unconfirmed consent, alongside suggested next steps labeled for staff review.
4. **Copy an AI prompt** — in the AI assistant, select a case and copy a template to see the safe pattern: de-identify, prompt, review.
5. **Generate the weekly report** — one click builds a funder-ready summary with a copy button.

## The role of Claude

I used Claude in two ways, and the distinction matters to me:

1. **As a build partner.** Claude helped me structure the code, design the interface, and think through edge cases (like what "missing information" should mean for a case). I directed the product decisions — which fields matter at intake, what a coordinator checks first in the morning, why consent has to block referrals — based on how these workflows actually run in nonprofit settings.
2. **As a tool for staff, by design.** The in-app AI panel doesn't call an API. It teaches a safer pattern: staff copy a de-identified, well-scoped prompt into Claude, then review and edit the output. Every template forbids eligibility judgments, and one template exists purely to audit AI output for risk before it's used.

## Responsible AI and privacy approach

Four rules appear on every AI-related feature in the app:

- **AI supports staff; it does not make decisions.**
- **Use de-identified data only** — never paste names, contact details, or ID numbers into an AI tool.
- **Trained humans make all final eligibility and service decisions.**
- **Bilingual staff verify every translation before it reaches a family.**

And the guardrails are structural, not decorative:

- Intake cannot be saved without the consent checkbox, and a case without confirmed consent is flagged and blocks suggested referrals.
- The intake form and staff guide instruct users to record initials or case IDs only — no full names, addresses, phone numbers, SSNs, immigration details, or medical records.
- Prompt templates pull only non-identifying fields.
- The "Review AI output for risk" template gives staff a repeatable way to catch invented facts, implied decisions, sensitive data, and overconfident tone.
- Demo data is entirely fictional and lives in the browser; the guide states plainly that real client data belongs in an approved, access-controlled system.

## Pilot plan

A two-week pilot with one community health or nonprofit team:

1. **Observe first (days 1–3):** shadow the current intake, follow-up, and reporting workflow before changing anything.
2. **Train 2–3 staff members (days 4–5):** hands-on sessions using the demo and the in-app staff guide.
3. **Run in parallel (week 2):** the team uses the tool alongside their existing process for new intakes and follow-ups.
4. **Collect staff feedback:** short daily check-ins plus an end-of-pilot usability conversation.
5. **Revise based on real staff behavior:** adapt the tool to how people actually work, not the other way around.

## Success metrics

- **Overdue follow-ups**, measured before and after the pilot.
- **Time required to create the weekly report**, compared with the team's current method.
- **Completeness of intake notes** — fewer cases flagged with missing consent, contact method, or follow-up dates.
- **Staff feedback on usability** — would the team keep using it, and what would they change first?

## What I learned

- Workflow design is the hard part; the code exists to serve it. The most useful screens came from asking "what does a coordinator check first on Monday morning?" rather than "what can I build?"
- Guardrails have to live in the product, not in a disclaimer. Making consent a blocking field changes how the tool gets used.
- Writing the handoff documentation *inside* the app forced me to design for the second user — the volunteer who joins after I'm gone.
- Working with Claude iteratively — describing the workflow, reviewing the output, correcting assumptions — is a skill of its own, and it's the skill I'd be training nonprofit staff in.

## What I would do differently if rebuilding this

- **Start with the pilot plan, not the features.** I designed the tool first and the evaluation plan second; a real engagement should begin with baseline measurement of the existing workflow.
- **Involve a community health worker from day one.** My own field experience shaped the design, but even one hour of co-design with a current frontline worker would have caught assumptions earlier.
- **Design the data model for the audit trail from the start.** Adding "who changed what, when" later is much harder than building it in.
- **Write the "what not to enter" guidance before the intake form**, so privacy constraints shape the fields instead of annotating them.
- **Keep the AI templates in a separate, editable file** so a program coordinator could adjust prompt wording without touching application code.

## What I would improve next

1. **Backend and auth:** connect Firebase (Firestore + Authentication) for shared, role-based access. The storage layer is isolated behind one `Store` object in `js/data.js` — only `Store.load`/`Store.save` need to change.
2. **Real AI integration with review gates:** every AI draft enters a "pending staff review" state before it can be saved to a case.
3. **Audit trail** for accountability and funder reporting.
4. **Language support in the UI itself**, starting with Spanish and Arabic toggles.
5. **The pilot described above** — the improvement that matters most.

## Interview-ready explanation (60 seconds)

"In my public health and nonprofit work, family support requests lived in scattered notes, emails, and spreadsheets — follow-ups slipped and reporting impact was painful. So I built the Community Health Access Navigator: staff record intakes with a required consent step, track needs like Medi-Cal and CalFresh, and see a dashboard that surfaces high-priority cases needing human review first. Each case shows a missing-information checklist and suggested next steps, clearly labeled for staff review, and a weekly impact report generates in one click. The AI piece is deliberately careful: instead of automating decisions, the app includes prompt templates staff copy into Claude — always with de-identified data, always with trained humans making the final call, and including one template that audits AI output itself for invented facts or implied decisions. I built it with Claude as a product-thinking and coding partner, and the training and handoff guide lives inside the app — because a tool a nonprofit can't sustain after you leave isn't really a tool."

## How this connects to Claude Corps

Claude Corps looks for people who can enter a mission-driven organization, understand a messy real-world workflow, build practical AI-assisted tools with non-technical staff in mind, train people to use them responsibly, and leave behind something sustainable. This project rehearses exactly that arc: it starts from a workflow problem I've lived inside public health and nonprofit operations, uses AI where it genuinely helps while keeping trained humans in charge of every decision, ships with its own training and handoff plan, and comes with a pilot plan and success metrics ready for a real team. I built the prototype with Claude as a product-thinking and coding partner — the same collaborative pattern I would bring to a host organization.

---

## Running and deploying

**Run locally:** open `index.html` in any modern browser. No build step, no dependencies. Use "Reset demo data" in the sidebar to restore the original sample cases.

**Deploy on GitHub Pages:**

1. Create a public GitHub repository and push (or upload) this folder so `index.html` sits at the repository root:
   ```bash
   git init
   git add .
   git commit -m "Community Health Access Navigator prototype v2"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/community-health-navigator.git
   git push -u origin main
   ```
2. In the repository: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
3. After a minute or two the app is live at `https://YOUR-USERNAME.github.io/community-health-navigator/`. Add that link to the top of this README, your fellowship application, and LinkedIn.

**Project structure:**

```
community-health-navigator/
├── index.html          # App shell: all seven views + case detail drawer
├── css/
│   └── styles.css      # Design system: palette, type, layout, responsive rules
├── js/
│   ├── data.js         # Fictional demo data + storage adapter (Firebase-ready seam)
│   └── app.js          # Views, filters, rules for missing info & next steps, report, prompts
├── README.md
├── PORTFOLIO_NOTES.md  # Short description, LinkedIn post, interview talking points
└── CHANGELOG.md
```

**Firebase note:** all persistence goes through the `Store` object in `js/data.js`. To move to Firestore later, replace the bodies of `Store.load` and `Store.save` with Firestore reads/writes — no other file needs to change.

---

*All family data in this prototype is fictional. This tool supports trained staff; it does not make eligibility or service decisions.*
