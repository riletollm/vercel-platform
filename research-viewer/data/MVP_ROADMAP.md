# MVP Roadmap — 6-Week Build Plan

## Overview

**Goal:** Ship a working platform for SSEN Cable Jointer (ST1332) training that demonstrates faster time-to-competency, improved mentor efficiency, and better safety outcomes.

**Partner:** Scottish and Southern Electric Networks (SSEN)  
**Standard:** ST1332 Power industry distribution cable jointer  
**Scope:** 10-15 jointer apprentices, 6 weeks of development, 12 weeks of pilot

**Success Metrics:**
- **Time-to-competency:** 30% reduction (baseline 12-18 weeks → target 9-12 weeks)
- **Mentor efficiency:** 25% reduction in supervision hours
- **EPA readiness:** 90%+ pass rate (vs. typical 85%)
- **Safety:** Zero training-related incidents
- **Engagement:** 90%+ daily app usage (vs. 20-30% for traditional LMS)
- **Learner satisfaction:** NPS >50

---

## Week 1: Foundation & Content Prep

### Backend Setup
- [ ] Initialize project (Node/Express + PostgreSQL)
- [ ] Set up authentication (JWT, basic user management)
- [ ] Database schema:
  - Users (learner profile, metadata)
  - Content (videos, metadata, KSBs)
  - Interactions (everything learner does)
  - Competency (mastery tracking per KSB)
  - PA interactions (WhatsApp logs)
- [ ] API skeleton (no business logic yet, just CRUD endpoints)
- [ ] Environment setup (dev/staging/prod)

### Frontend Skeleton
- [ ] React PWA setup (Vite or CRA)
- [ ] Basic routing (login → feed → video player)
- [ ] UI mockups (feed layout, video player, streak badge)
- [ ] Local storage for session state

### Content & Standards (ST1332 Cable Jointer Focus)
- [ ] Map ST1332 to KSBs (extract from Skills England standard)
- [ ] Prioritize content to support SSEN's top pain points:
  - [ ] Hazard recognition (cable identification, electrical risks, flashover prevention)
  - [ ] Cable jointing procedures (LOTO, joint assembly, insulation)
  - [ ] Decision-making under pressure (fault-finding, scenario resolution)
  - [ ] Field safety (real-world conditions, mentor communication)
- [ ] Outline 20 micro-lessons covering foundation + scenario-based learning
  - Week 1-2: Classroom bridge (cable types, hazards, LOTO, basic procedures)
  - Week 3-4: On-site prep (field conditions, mentor relationships, progressive responsibility)
  - Week 5-8: Live work scenarios (fault-finding, decision-making, stretch challenges)
  - Week 9-12: EPA prep (practice assessment, readiness checks)
- [ ] Write scripts (90-120 sec each, field-relevant, safety-critical tone)
- [ ] Identify video sources:
  - [ ] AI generation (Synthesia) for knowledge modules
  - [ ] Real footage from SSEN (cable joints, field conditions) — **ask SSEN for access**
  - [ ] Screen recordings (procedures, diagrams)
  - [ ] Animated hazard scenarios
- [ ] Get SSEN sign-off on content (safety review critical)

### WhatsApp Setup
- [ ] Register WhatsApp Business Account
- [ ] Create first PA message templates
- [ ] Set up webhook for receiving messages (not yet intelligent, just echo responses)

**Deliverable:** Rough working prototype, PostgreSQL running, basic API calls working.

---

## Week 2: Algorithm & Content Engine

### Competency Engine
- [ ] Implement mastery calculation logic:
  - Interaction → score
  - Score → KSB update
  - Moving average (recent interactions weighted higher)
- [ ] Implement mastery thresholds (0-100%, stages: beginner, intermediate, advanced)
- [ ] Add prerequisites logic (if exists for your standard)
- [ ] Spaced repetition timing tables (1d, 3d, 1w, 2w review intervals)

### Content Algorithm
- [ ] Implement "What's Next" logic:
  - Check KSB progress
  - Determine if review is due
  - Rank available content
  - Return top content for today
- [ ] Difficulty adaptation (not in v1, but skeleton in place)
- [ ] Test with mock learner data

### Content Generation (Batch)
- [ ] Generate 15-20 short videos:
  - Use Synthesia or HeyGen for basic AI video gen
  - Or: Use screen recording + voiceover
  - Or: Template-based (slides + voiceover)
  - Goal: 90-second per video, good quality, conversational
- [ ] Generate images for social proof / peer context
- [ ] Store videos in S3, CDN cache
- [ ] Create content metadata (title, KSB mapping, difficulty, runtime)

### Feed API
- [ ] Implement GET /api/v1/feed
  - Takes learner context
  - Returns top 3-5 content for today
  - Includes streak, mastery %, next KSB focus

**Deliverable:** Working feed API, content stored and retrievable, basic algorithm tested.

---

## Week 3: Frontend & Interaction Loop

### App UI
- [ ] Video feed (TikTok-like layout):
  - Swipe down to see next video
  - Video player (play/pause, progress bar)
  - Title + skill name + mastery % visible
  - Streak badge (fixed or sliding)
- [ ] Quick check UI:
  - Display question after video
  - 2-4 multiple choice options or free response
  - Clear "submit" button
- [ ] Mastery display:
  - Skill breakdown (% on each KSB)
  - Overall progress
  - Next milestone marker
- [ ] Simple onboarding:
  - "What's your role?"
  - "What's your experience level?"
  - "Let's get started"

### Interaction Logging
- [ ] Implement POST /api/v1/interactions
  - Log video watch (start, end, duration)
  - Log check answers
  - Calculate score immediately
  - Return feedback ("Correct!" or "Here's why...")
- [ ] Streak logic:
  - Increment if user engages day-to-day
  - Reset if >1 day gap
  - Display prominently
- [ ] Update competency in background

### Simple Analytics
- [ ] Log all events (view, answer, time spent)
- [ ] Dashboard (internal):
  - Cohort engagement (daily active users)
  - Average videos watched per day
  - Mastery distribution (how many at 0-25%, 25-50%, etc.)
  - Most-watched content

**Deliverable:** Learnable app, users can watch videos and answer questions, data is tracked.

---

## Week 4: Personal Assistant (WhatsApp)

### PA Bot Basics
- [ ] Webhook receiver for WhatsApp messages
- [ ] Simple NLP routing:
  - "hi" → greeting + today's focus
  - "help" → link to FAQ
  - "streak" → return current streak
  - "mastery" → return current mastery %
  - "video" → link to current video in app
  - Free text → route to LLM for response + content suggestion

### PA Logic (Non-Intelligent First)
- [ ] Manual nudge schedule:
  - 9am: "Morning! Today's focus: [skill]. Got 90 sec?"
  - 6pm: "How'd it go? Tomorrow's focus: [next skill]"
  - Weekly: "You're at [streak] days. Keep going!"
- [ ] Streak milestone alerts:
  - 7 days: "One week! 🔥"
  - 30 days: "One month habit — this is real"

### PA Data Integration
- [ ] Link WhatsApp ID to learner ID
- [ ] PA service reads learner's current:
  - Mastery level
  - Streak
  - Latest interaction
  - Next KSB to focus on

### Message Templates
- [ ] Pre-write 10-15 message variations
- [ ] Randomize to avoid repetition
- [ ] Include emojis (not overdone)
- [ ] Keep tone conversational, not corporate

**Deliverable:** PA sends scheduled nudges, responds to basic queries, learners feel "coached."

---

## Week 5: Evidence Builder & Analytics

### Evidence Tracking
- [ ] Every interaction creates an evidence record:
  - When learner watched [content], answered [questions], scored [%]
  - Timestamp + KSB mapped
- [ ] Competency timeline:
  - "Learner was at 30% on KSB-1 on Day 3"
  - "Learner reached 70% on KSB-1 on Day 21"
- [ ] Portfolio summary:
  - Current mastery per KSB
  - Time to competency (days from start)
  - Engagement pattern (consistent? sporadic?)
  - Challenge engagement (how many stretch attempts?)

### Dashboard (for Institution)
- [ ] Admin view:
  - Learner roster
  - Cohort mastery heatmap (who's where)
  - Engagement timeline (daily active users)
  - Content performance (which videos highest engagement)
- [ ] Instructor view (if applicable):
  - See cohort progress
  - Identify struggling learners (auto-flag at <30% after 1 week)
  - Export evidence for specific learner

### Export Functionality
- [ ] Generate PDF portfolio (learner view):
  - "Here's your learning journey"
  - Mastery breakdown
  - Timeline
  - Areas of strength + growth
- [ ] Export for EPAO (future):
  - Competency map (how mastery maps to KSBs)
  - Interaction history (evidence of learning)
  - Readiness statement

**Deliverable:** Evidence trail auto-built, dashboards show what's happening, data is exportable.

---

## Week 6: Testing, Iteration & Launch

### QA & Bug Fixes
- [ ] Test all workflows end-to-end:
  - Sign up → watch video → answer check → streak increments → PA nudges
  - Video playback (different devices, connection speeds)
  - Offline resilience (cache videos locally)
- [ ] Performance testing:
  - API under load (concurrent users)
  - Video delivery speed
  - Database queries optimized
- [ ] Security review:
  - Auth tokens working
  - User data isolated
  - API rate limiting
- [ ] Fix bugs found

### Onboarding Real Users
- [ ] Recruit 50 test learners (from partner training provider or cohort)
- [ ] Communicate what this is: "We're testing a new way to learn. Feedback is gold."
- [ ] Provide onboarding guide (email + WhatsApp message)
- [ ] Set expectations: daily 90-sec commitment for 4 weeks, then we assess

### Monitoring & Instrumentation
- [ ] Real-time dashboards:
  - Who's active right now
  - Error tracking (Sentry or similar)
  - Performance metrics (API response times)
- [ ] Alert system:
  - If API is down → notify ops
  - If learner hasn't engaged in 3 days → notify them (from PA)
  - If error rate spikes → notify team

### Soft Launch
- [ ] Release to 50 test users
- [ ] Daily standup: "What's breaking? What's engaging?"
- [ ] Iterate on content (if a video isn't resonating, swap it)
- [ ] Iterate on PA nudges (are learners responding? adjust tone/timing)
- [ ] Collect user feedback:
  - "How does this feel vs. your last training?"
  - "What's missing?"
  - "Would you recommend this?"

### Retrospective & Roadmap
- [ ] Analyze data from 4-week pilot:
  - Engagement rate (% using daily)
  - Completion rate (% finishing assigned content)
  - Learning signal (are mastery scores increasing? Are people retaining?)
  - NPS / satisfaction
- [ ] Document findings
- [ ] Plan next phase:
  - More standards? More learners? Scaling the tech?
  - Instructor integrations?
  - Real EPA integration?

**Deliverable:** Live pilot running, data flowing, learner feedback captured.

---

## Success Criteria at End of Week 6

- [ ] **Product Works:** No critical bugs, core features functional
- [ ] **Users Engage:** 60%+ weekly active users (baseline: 20-30% for traditional LMS)
- [ ] **Learning Signal:** Mastery scores increase over time (avg +1-2% per week)
- [ ] **Evidence Trail:** Auto-generated portfolio for each learner
- [ ] **Feedback:** NPS >40, learners say "this is better than my LMS"
- [ ] **Scalability:** System handles 50 users without degradation; architecture plan for 1,000+

---

## Out of Scope for MVP (Do Later)

- ❌ Expansion to other roles (Fitters, Linespersons — Phase 2)
- ❌ Difficulty adaptation (skeleton in place, not active for POC)
- ❌ Social leaderboards (cohort-only progress, no public rankings)
- ❌ Instructor/mentor admin interface (basic view only, not full dashboard)
- ❌ Advanced analytics (basic engagement + mastery only)
- ❌ Mobile app (PWA is web-based, installable but not native app)
- ❌ Deep EPAO integration (export works, but no API connection to EPAO systems yet)
- ❌ Video generation API (all content pre-generated for launch)
- ❌ Multi-language support (English only for SSEN pilot)
- ❌ Full WCAG accessibility (basic accessibility only)

---

## Tech Choices for Fast Delivery

**Why this matters:** You want to prove concept before over-engineering.

- **Database:** PostgreSQL (proven, straightforward)
- **Backend:** Node.js + Express (fast iteration, JavaScript everywhere)
- **Frontend:** React (large ecosystem, lots of tutorials)
- **Hosting:** Railway or Render (easier than AWS for small team)
- **Video:** Pre-generate with Synthesia (not on-demand, faster to launch)
- **WhatsApp:** Official Business API (not webhook chaos)
- **Auth:** Simple JWT (not OAuth complexity)

**Avoid:**
- Microservices (overkill for MVP)
- Kubernetes (use Docker on simple server)
- Fancy ML (algorithm logic is deterministic, not ML)
- Custom video encoding (use existing service)

---

## Team & Effort

**Estimated team size:** 2-3 engineers (1 backend, 1 frontend, 1 part-time DevOps/PM)

**Effort breakdown:**
- Backend: 60% (algorithm, data model, PA integration)
- Frontend: 30% (UI/UX, mobile responsiveness)
- DevOps/Content: 10% (infrastructure, video generation, onboarding)

**Timeline**: 6 weeks assumes:
- Full-time focus (40h/week per person)
- Clear requirements (this doc + daily standups)
- Minimal distractions
- Willingness to cut scope (if something stalls, drop it for post-MVP)

---

## Next Steps After MVP (If POC Succeeds)

### Phase 2 (Months 3-6): SSEN Expansion
1. **Scale to larger cohorts:** 50+ jointers per year
2. **Expand to other SSEN roles:** Fitters (ST1331), Linespersons (ST1330)
3. **Mentor dashboard:** Full view of cohort progress, intervention flags
4. **Incident tracking:** Formal integration of on-site safety data
5. **EPA engagement:** Work with EPA body to formalize evidence integration

### Phase 3 (Months 7-12): Market Readiness
1. **Other DNOs (Distribution Network Operators):** UK Power Networks, Electricity North West, etc.
2. **SaaS productization:** Self-service platform for training providers
3. **Content marketplace:** Reusable micro-lesson library (jointer + other roles)
4. **Advanced analytics:** Cohort comparisons, competency modeling

### Phase 4+ (Year 2): Enterprise
1. **Multi-sector:** Corporate training, healthcare, manufacturing
2. **White-label:** Training providers rebrand and resell
3. **International:** Adapt for other countries' apprenticeship frameworks

But first: **Make SSEN jointers love it and hit the metrics. The rest follows.**

---

## How to Use This Roadmap

- **Week 1:** Set up team, provision servers, start coding
- **Weeks 2-5:** Daily standups, iterate, test
- **Week 6:** Launch pilot, collect data, celebrate
- **Post-MVP:** Share results, decide on next investment

Good luck. This is genuinely exciting. 🚀
