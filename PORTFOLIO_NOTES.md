# Portfolio notes — Community Health Access Navigator

## Short portfolio description (~90 words)

**Community Health Access Navigator** — a web app prototype that helps community health and nonprofit staff manage family intake, track needs and referrals, organize follow-up, and generate weekly impact reports. I designed the workflow from my public health and nonprofit operations experience — health coverage navigation, food distribution coordination, and program evaluation — and built the prototype with Claude as a product-thinking and coding partner. AI is positioned as staff support only: the tool flags gaps, summarizes, and drafts, while trained humans make every eligibility and service decision. Ships with an in-app staff guide, pilot plan, and success metrics.

## LinkedIn post draft

I built a prototype for a problem I lived inside during my public health and nonprofit work: family support requests scattered across notes, emails, and spreadsheets — with follow-ups slipping and impact reporting eating hours.

The Community Health Access Navigator helps community health teams manage intake, track referrals, surface high-priority cases for human review, and generate weekly impact reports in one click.

The part I'm most deliberate about is the AI design. The tool doesn't automate decisions. Instead, it includes prompt templates staff copy into Claude — summarize notes, draft a follow-up, translate an explanation into plain language — always with de-identified data, and always with trained humans making final eligibility and service calls. There's even a template that audits AI output itself for invented facts or implied decisions.

Built with Claude as a product-thinking and coding partner, with the training and handoff guide inside the app — because a tool a nonprofit can't sustain isn't really a tool.

Live demo + code: [your GitHub Pages link]

#PublicHealth #Nonprofits #ResponsibleAI #CommunityHealth

## 60-second interview explanation

"In my public health and nonprofit work, I kept seeing the same problem: family support requests scattered across notes, emails, and spreadsheets. Follow-ups slipped, documentation varied by staff member, and reporting impact at the end of the month was painful.

So I built the Community Health Access Navigator — a prototype where staff record intakes with a required consent step, track needs like Medi-Cal, CalFresh, and food distribution, and see a dashboard that surfaces high-priority cases needing human review first. Each case shows a missing-information checklist and suggested next steps, clearly labeled for staff review. It also generates a weekly impact report in one click.

The AI piece is deliberately careful. Instead of automating decisions, the app includes prompt templates staff copy into Claude — summarize notes, draft a follow-up, translate an explanation into plain language — always with de-identified data, and always with the rule that trained humans make the final call. One template even audits AI output itself for invented facts or implied decisions.

I built it with Claude as a product-thinking and coding partner, and I wrote the training and handoff guide into the app itself — because a tool a nonprofit can't sustain after you leave isn't really a tool. That's the kind of work I want to do through Claude Corps."

*(Read at a natural pace, this runs about 60 seconds. If you need 45, cut the middle paragraph's second sentence and the report line.)*

## Talking points if they probe deeper

- **Why no backend?** Deliberate scoping: prove the workflow first. Persistence is isolated behind one `Store` object, so Firebase drops in later without touching the UI code. The app itself states this scope on the dashboard and About section.
- **Why doesn't the AI panel call an API?** Two reasons: it models the safe pattern (de-identify, prompt, review) that under-resourced orgs can adopt today with just a Claude account, and it keeps the demo free of any suggestion that AI is making case decisions.
- **Biggest design decision?** Making consent structural — intake can't save without it, and unconfirmed consent flags the case and blocks suggested referrals.
- **How would you know it works?** The pilot plan in the app: two weeks with one team, observe before changing anything, train 2–3 staff, then measure overdue follow-ups, weekly-report time, and intake-note completeness against baseline, plus staff usability feedback.
- **What would you do differently?** Start with baseline measurement and co-design with a frontline worker from day one — the README has a full "what I would do differently" section.
