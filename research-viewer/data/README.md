# Learning Experience Platform — Project Docs

## Quick Overview

This is a disruptive learning platform designed to replace the LMS paradigm. Instead of managing learning like an institutional checkbox, we're building a conversational, mobile-native experience that feels like TikTok but delivers genuine competency.

**Core Thesis:** The disruption isn't becoming a better LMS. It's making the concept of an LMS obsolete because learning management implies learning is something you manage. Real learning is something you do in flow, and you track it as a side effect.

---

## The Docs (Read in Order)

### 1. **VISION.md** — The Big Picture
- Problem we're solving
- Why this works
- Initial use case (UK apprenticeships)
- Success metrics

**Start here if:** You're new to the project and need context.

### 2. **LEARNER_JOURNEY.md** — The Experience
- What a learner sees on day 1, week 1, month 1, month 3
- Emotional arc (how we want them to feel)
- What data gets built behind the scenes

**Read this if:** You want to understand the user experience and what makes it different.

### 3. **ARCHITECTURE.md** — The Technical Blueprint
- System components diagram
- Data models
- How each service works
- Tech stack recommendations
- Security & compliance

**Read this if:** You're building the product or want to understand how it works under the hood.

### 4. **MVP_ROADMAP.md** — The Build Plan
- Week-by-week breakdown (6 weeks)
- What gets built each week
- Success criteria
- What's out of scope

**Read this if:** You're about to start development or project managing it.

---

## Key Concepts

### The Three Layers

1. **App (TikTok-like feed)**
   - Mobile-first PWA
   - 90-second micro-videos
   - Algorithm shows "what's next"
   - Streaks, mastery visible
   - Feels like entertainment

2. **Personal Assistant (WhatsApp Coach)**
   - AI coach on WhatsApp
   - Daily nudges, proactive reminders
   - Answers questions in real-time
   - Celebrates milestones
   - Conversational, human-like

3. **Silent Backend (Competency Engine)**
   - Tracks mastery on KSBs
   - Runs spaced repetition algorithm
   - Generates evidence/portfolio
   - Maps to occupational standards
   - Auto-builds audit trail

### Why It Works

- **Matches learner behavior** (mobile, short-form, social)
- **Habit-forming** (streaks, daily nudges, flow state)
- **Personalized** (algorithm adapts to pace, PA knows context)
- **Frictionless** (90 sec per day, no "I have to sit down and do training")
- **Invisible compliance** (audit trail builds as side effect)
- **Scalable** (AI generates content, applies to any standard)

---

## POC Target: SSEN Cable Jointer (ST1332)

**Partner:** Scottish and Southern Electric Networks (SSEN)  
**Problem:** Accelerate jointer training for ED2 delivery (reduce 12-18 week baseline to 9-12 weeks)

Why this target:
- Real partner with real urgency (ED2 workforce delivery)
- Safety-critical (improves hazard recognition, reduces incidents)
- Clear competency framework (ST1332 KSBs)
- Measurable success (time-to-competency, mentor efficiency, EPA pass rates)
- Commercial signal (paying customer from day 1 if successful)

**Beyond MVP:** Scale to other DNO roles, then other sectors (corporate training, healthcare, etc.)

---

## The MVP (6 Weeks, SSEN Jointer Focus)

**Goal:** Prove the concept with 10-15 SSEN cable jointers, measurably reducing time-to-competency.

**What you'll ship:**
- Learnable PWA (web app on mobile)
- 20 jointer-specific micro-videos (cable ID, hazards, procedures, fault-finding, decision-making)
- WhatsApp PA coach (daily nudges, field support, milestones)
- Evidence tracker (auto-built EPA portfolio)
- SSEN mentor dashboard (see learner progress, flag at-risk)

**Success metrics:**
- 30% reduction in time-to-competency (12-18 weeks → 9-12 weeks)
- 25% reduction in mentor supervision hours
- 90%+ EPA pass rate
- 90%+ daily app engagement
- Zero training-related safety incidents
- NPS >50

---

## Team & Timeline

**Effort:** 2-3 engineers, 6 weeks, full-time.

**Breakdown:**
- 1 backend engineer (60% — algorithm, PA, data)
- 1 frontend engineer (30% — UI/UX)
- 1 part-time (10% — DevOps, content, project management)

**Cost:** Rough estimate ~$50-80k for team + infrastructure.

---

## What Makes This Different

Existing solutions (EdApp, Disco, etc.):
- Still think in "courses" / "modules"
- Gamification first (leaderboards, badges)
- Desktop-first or native app-first
- Don't map to standards well
- Compliance is afterthought

This platform:
- Thinks in "competency snapshots"
- Habit-formation through flow (not gaming)
- Mobile/messaging-first
- Standards-aligned from day 1
- Compliance is automatic byproduct
- Conversational + algorithmic (not just content delivery)

---

## Post-MVP Roadmap (Not in This Release)

Once the concept is proven:

1. **Expand Content** — Multiple standards, multiple sectors
2. **Instructor Tools** — Dashboard to see learner cohort, flag at-risk learners
3. **Human Escalation** — PA connects to mentors/instructors for complex questions
4. **EPA Integration** — Deep integration with EPAO systems (portfolio → assessment ready)
5. **Monetize** — SaaS product, white-label for training providers
6. **Scale** — Multi-tenant, handle 1000s of concurrent learners

---

## Critical Decisions Made

1. **SSEN Jointer as POC, not generic apprenticeship** — Real partner, real urgency, measurable ROI
2. **WhatsApp + PWA, not native app** — Faster to launch, no app store friction, field-friendly
3. **Content pre-generated + SSEN-sourced** — Real cable joints, real field conditions, safety-reviewed
4. **Mentor involvement, not replacement** — PA supports mentor, doesn't replace; mentor stays essential
5. **Safety-first, mastery-second** — Every video/scenario prioritizes hazard recognition
6. **Deterministic algorithm, not ML** — Fast iteration, SSEN can understand and trust the sequencing

---

## Open Questions (To Resolve During Build)

1. Which apprenticeship standard to target first? (Tech? Skilled trades? Admin?)
2. How to handle content gaps? (Do we fill them with original content or point to external resources?)
3. Should PA have personality quirks? (Funny? Motivational? Neutral?)
4. How aggressive with notifications? (Daily? Twice daily? Only when ready for next content?)
5. How to handle learners who are "done" with a standard? (Celebrate? Move to next? Reset for mastery?)

---

## Resources

- **TalentLMS API:** Connected, credentials in TOOLS.md
- **Apprenticeship Standards:** https://www.skillsengland.education.gov.uk/
- **EPA Guidance:** https://www.apprenticeships.gov.uk/employers/end-point-assessments
- **AI Video Gen:** Synthesia, HeyGen, Runway
- **AI LLM:** OpenAI, Anthropic Claude, open-source

---

## How to Get Started

1. **Assemble team** — 2-3 engineers, clear roles
2. **Pick standard** — Which apprenticeship to focus on?
3. **Generate content** — Script + video gen for 15-20 micro-lessons
4. **Start Week 1** — Set up backend, DB, basic API
5. **Daily standups** — 15 min, what's blocking?
6. **Weekly review** — What did we learn? What needs to pivot?

---

## Success Looks Like

- **Week 6 (MVP Launch):** SSEN pilot live with 10-15 jointers, 90%+ daily engagement
- **Week 12 (Pilot End):** Time-to-competency reduced 30%, mentor efficiency up 25%, EPA pass rate 90%+
- **Month 6 (Phase 2):** Scaled to 50+ jointers/year, expanded to Fitters & Linespersons
- **Month 12:** Other DNOs (UK Power Networks, ENWL) using platform
- **Year 1:** 500+ active learners across 3+ DNOs, revenue-positive

This is a real market opportunity. You're solving SSEN's documented problem (workforce acceleration for ED2) at exactly the moment they need it. If this works, it's not a prototype—it's a business.

---

## Contact / Questions

Reach out when you're ready to build. This is exciting stuff. 🚀
