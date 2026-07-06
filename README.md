# Community Health Access Navigator

A frontend prototype that helps community health and nonprofit staff manage family intake, track needs and referrals, stay on top of follow-ups, and generate weekly impact reports — with AI positioned strictly as staff support, never as a decision-maker.

**Live demo:** _(add your GitHub Pages link here after deploying — see below)_

---

## The problem

Community health and nonprofit teams often manage family support requests through a mix of paper notes, emails, spreadsheets, and memory. In my public health and nonprofit work — health coverage navigation, food distribution coordination, and program evaluation — I saw the same pattern repeatedly: intake details get lost, follow-ups slip, documentation is inconsistent from one staff member to the next, and at the end of the month it's genuinely hard to say how many families were served and what they needed most. The families with the highest needs are often the ones most affected by these gaps.

## Target users

- Community health workers
- Nonprofit program coordinators and case coordinators
- Volunteers doing intake or follow-up
- Program managers who report to leadership and funders

## What I built

A single-page web app (HTML/CSS/JavaScript, no backend required) with realistic demo data, built as a portfolio prototype for the Claude Corps Fellowship. I built this prototype with Claude as a product-thinking and coding partner; I designed the workflow based on my public health and nonprofit operations experience.

## Key features

- **Dashboard** — families served, open cases, follow-ups due, referrals made, food and health-coverage request counts, and a flagged **"Needs human review"** list that surfaces high-urgency or incomplete cases first.
- **Family intake form** — case ID/initials (not full names), preferred language, household size, contact method, needs checklist (Medi-Cal, Covered California, CalFresh, food distribution, caregiver support, transportation, housing referral, other), urgency, notes, a required consent checkbox, and a privacy reminder.
- **Case list** — search plus filters by status, need, and urgency, with "missing items" flags on each card.
- **Case detail panel** — family profile, per-need referral status, editable status and follow-up date, a notes timeline, a rule-based **missing information** checklist, and **suggested next steps** explicitly labeled for staff review.
- **AI assistant panel (demo, no API)** — six copy-ready prompt templates for Claude (summarize notes, identify missing info, draft a follow-up message, report narrative, plain-language eligibility explanation, staff checklist), optionally pre-filled with a selected de-identified case. The panel states: *"AI suggestions are for staff support only. Final eligibility and service decisions must be made by trained humans."*
- **Weekly impact report generator** — builds a copyable report from current data: families served, most common needs, follow-ups due, referrals made, cases needing review, and rule-based suggested operational improvements.
- **Staff guide & handoff section** — in-app documentation covering daily use, what data must never be entered, privacy and consent guidelines, a training plan for new staff, and workflow maintenance — so the tool can outlive the person who built it.

## The role of Claude

I used Claude in two ways, and the distinction matters to me:

1. **As a build partner.** Claude helped me structure the code, design the interface, and think through edge cases (like what "missing information" should mean for a case). I directed the product decisions — which fields matter at intake, what a coordinator checks first in the morning, why consent has to block referrals — based on how these workflows actually run in nonprofit settings.
2. **As a tool for staff, by design.** The in-app AI panel doesn't call an API. It teaches a safer pattern: staff copy a de-identified, well-scoped prompt into Claude, then review and edit the output. Every template forbids eligibility judgments and reminds bilingual staff to verify translations.

## Responsible AI and privacy approach

- **Humans decide.** The tool organizes information, flags gaps, and suggests next steps — it never determines eligibility or prioritizes families autonomously. This is repeated in the UI wherever a suggestion appears.
- **Data minimization by design.** The intake form and staff guide instruct users to record initials or case IDs only — no full names, addresses, phone numbers, SSNs, immigration details, or medical records. Demo data is entirely fictional.
- **Consent is structural, not decorative.** Intake cannot be saved without the consent checkbox, and a case without confirmed consent is flagged and blocks suggested referrals.
- **De-identified AI use.** Prompt templates only pull non-identifying fields, and the guide explicitly prohibits pasting identifying details into any AI tool.
- **Honest scope.** Demo data lives in the browser (localStorage). The guide states plainly that real client data belongs in an approved, access-controlled system.

## What I learned

- Workflow design is the hard part; the code exists to serve it. The most useful screens came from asking "what does a coordinator check first on Monday morning?" rather than "what can I build?"
- Guardrails have to live in the product, not in a disclaimer. Making consent a blocking field and labeling every suggestion "for staff review" changes how the tool gets used.
- Writing the handoff documentation *inside* the app forced me to design for the second user — the volunteer who joins after I'm gone — which is exactly the sustainability problem mission-driven orgs face with new tools.
- Working with Claude iteratively — describing the workflow, reviewing the output, correcting assumptions — is a skill of its own, and it's the skill I'd be training nonprofit staff in.

## What I would improve next

1. **Backend and auth:** connect Firebase (Firestore + Authentication) so multiple staff can share data with role-based access. The storage layer is already isolated in `js/data.js` — only `Store.load`/`Store.save` need to change.
2. **Real AI integration with review gates:** an opt-in Claude API integration where every AI draft enters a "pending staff review" state before it can be saved to a case.
3. **Audit trail:** log who changed what and when, which matters for both accountability and funder reporting.
4. **Language support in the UI itself:** starting with Spanish and Arabic interface toggles, informed by staff and community feedback.
5. **Pilot with a real team:** sit with community health workers for a week, watch where the tool fights their habits, and revise.

## How this connects to Claude Corps

Claude Corps looks for people who can enter a mission-driven organization, understand a messy real-world workflow, build practical AI-assisted tools with non-technical staff in mind, train people to use them responsibly, and leave behind something sustainable. This project is a rehearsal of exactly that arc: it starts from a workflow problem I've lived inside public health and nonprofit operations, uses AI where it genuinely helps (summarizing, drafting, organizing) while keeping trained humans in charge of every decision, and ships with its own training and handoff plan. I built the prototype with Claude as a product-thinking and coding partner — the same collaborative pattern I would bring to a host organization.

---

## Running and deploying

**Run locally:** open `index.html` in any modern browser. No build step, no dependencies. Use "Reset demo data" in the sidebar to restore the original sample cases.

**Deploy on GitHub Pages:**

1. Create a new GitHub repository (e.g., `community-health-navigator`) and push this folder:
   ```bash
   git init
   git add .
   git commit -m "Community Health Access Navigator prototype"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/community-health-navigator.git
   git push -u origin main
   ```
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**, choose the **main** branch and **/ (root)** folder, and save.
4. After a minute or two, the app is live at `https://YOUR-USERNAME.github.io/community-health-navigator/`. Add that link to the top of this README and to your fellowship application.

**Project structure:**

```
community-health-navigator/
├── index.html          # App shell: all six views + case detail drawer
├── css/
│   └── styles.css      # Design system: palette, type, layout, responsive rules
├── js/
│   ├── data.js         # Fictional demo data + storage adapter (Firebase-ready seam)
│   └── app.js          # Views, filters, rules for missing info & next steps, report, prompts
└── README.md
```

**Firebase note:** all persistence goes through the `Store` object in `js/data.js`. To move to Firestore later, replace the bodies of `Store.load` and `Store.save` with Firestore reads/writes — no other file needs to change.

---

*All family data in this prototype is fictional. This tool supports trained staff; it does not make eligibility or service decisions.*
