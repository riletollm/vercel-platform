# Technical Architecture

## System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      LEARNER FACING                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Mobile PWA (React/Vue)          WhatsApp Bot               │
│  ├─ Feed UI (TikTok-like)        ├─ Personal PA             │
│  ├─ Video Player                 ├─ Conversational AI       │
│  ├─ Quick Checks                 ├─ Nudges & Reminders      │
│  ├─ Mastery Display              └─ Question Answering      │
│  ├─ Streak Counter               ↓                           │
│  └─ Progress Dashboard           WhatsApp Cloud API         │
│       ↓                                                       │
│  Local Storage (session, streaks, answers)                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
           ↓                                   ↓
        REST/GraphQL                      REST/WebSocket
           ↓                                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / BACKEND                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Authentication & Authorization                             │
│  ├─ JWT tokens                                              │
│  ├─ OAuth (via provider's SSO if available)                │
│  └─ Session management                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│              CORE BUSINESS LOGIC SERVICES                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Competency Engine                                           │
│  ├─ KSB Mapping & Tracking                                 │
│  ├─ Mastery Calculation                                     │
│  ├─ Gap Detection                                           │
│  └─ Readiness Assessment                                    │
│                                                               │
│  Content Algorithm Service                                  │
│  ├─ Spaced Repetition Logic                                │
│  ├─ Learner Path Sequencing                                │
│  ├─ "What's Next" Determination                            │
│  ├─ Difficulty Adaptation                                   │
│  └─ Peer Context Surfacing                                 │
│                                                               │
│  PA (Personal Assistant) Service                            │
│  ├─ Learner Context (history, level, goals)               │
│  ├─ Nudge Generation                                        │
│  ├─ Question Routing & Response Generation                │
│  ├─ Motivation & Milestone Detection                       │
│  └─ Human Escalation Logic                                 │
│                                                               │
│  Evidence Builder Service                                   │
│  ├─ Interaction Logging (all activities)                   │
│  ├─ KSB Mapping (evidence → standard)                      │
│  ├─ Portfolio Generation                                    │
│  ├─ EPA Readiness Summary                                  │
│  └─ Audit Trail Maintenance                                │
│                                                               │
│  Content Generation Service (AI-Powered)                    │
│  ├─ Video Generation (Synthesia, HeyGen, etc.)            │
│  ├─ Image Generation (DALL-E, Midjourney, etc.)           │
│  ├─ Voiceover Generation (Eleven Labs, etc.)              │
│  ├─ Template-based Content Assembly                        │
│  └─ Content Versioning                                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Primary Database (PostgreSQL)                              │
│  ├─ Learner Profiles                                        │
│  ├─ Competency Records (mastery tracking)                  │
│  ├─ Learning Sessions (interactions)                        │
│  ├─ Content Metadata                                        │
│  ├─ KSB Standards Library                                   │
│  └─ Evidence Artifacts                                      │
│                                                               │
│  Cache Layer (Redis)                                        │
│  ├─ Session cache                                           │
│  ├─ Algorithm state (spaced repetition timing)             │
│  ├─ Learner context (for PA)                               │
│  └─ Frequently accessed metadata                            │
│                                                               │
│  Content Storage (S3 or equivalent)                         │
│  ├─ Video files                                             │
│  ├─ Images                                                  │
│  ├─ Audio files                                             │
│  └─ Source content (for processing)                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│                  INTEGRATIONS                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  LMS Integration (Source Data)                              │
│  ├─ TalentLMS API (for MVP, can be swapped)                │
│  ├─ Course Catalog Sync                                     │
│  ├─ Enrollment Data                                         │
│  └─ User Management                                         │
│                                                               │
│  Third-Party Services                                       │
│  ├─ WhatsApp Business API                                   │
│  ├─ AI API Providers (video, image, voice, LLM)           │
│  ├─ Analytics (Mixpanel, Amplitude, or custom)            │
│  ├─ Email Service (SendGrid, SES)                          │
│  └─ Optional: EPAO Systems (future)                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Services Deep Dive

### 1. Competency Engine

**Purpose:** Track and calculate mastery across KSBs

**Data Model:**
```
Learner
├─ id
├─ role / standard
├─ cohort
└─ competency_records[] → KSB → { mastery_pct, history[] }

Interaction Record
├─ learner_id
├─ content_id
├─ ksb_id
├─ timestamp
├─ performance (score, time spent, difficulty rating)
└─ context (is_review, is_challenge, etc.)

Competency Snapshot
├─ learner_id
├─ ksb_id
├─ mastery_pct (0-100)
├─ last_engaged
├─ next_review_date (from spaced repetition)
└─ readiness_signal (ready_to_advance, needs_review, etc.)
```

**Logic:**
- Mastery % = weighted average of recent interactions (most recent weighted higher)
- Difficulty adapts: if performance >85%, increase difficulty; <70%, review basics
- Mastery locks at 100% temporarily after 3 consecutive high scores, then decays slowly to encourage review

---

### 2. Content Algorithm Service

**Purpose:** Decide "what's next" for each learner

**Algorithm Flow:**
```
Input: Learner ID, Current Context
  ↓
1. Get Learner's KSB Progress Map
   ├─ Which skills are mastered (>80%)?
   ├─ Which are in progress (40-80%)?
   ├─ Which haven't been touched (<40%)?
   └─ Which need review (mastered >2 weeks ago)?

2. Apply Spaced Repetition Rules
   ├─ If skill mastered 1 week ago → surface for review
   ├─ If skill in progress → continue deepening
   ├─ If skill weak → decide: reteach basics or try different angle?

3. Check Prerequisites
   ├─ Can't do skill B without skill A?
   ├─ Block B, redirect to A if not ready

4. Get Difficulty Adaptation
   ├─ If learner struggling → show foundational content
   ├─ If learner excelling → show challenge content
   └─ If learner neutral → show variety (mix easy + stretch)

5. Rank Available Content
   ├─ Score each video/module by:
   │   ├─ Relevance to next KSB
   │   ├─ Learner's recent struggle areas
   │   ├─ Time since last review (if review needed)
   │   ├─ Format preference (if known)
   │   └─ Peer engagement (what helped others like them)
   └─ Return top 3-5 ranked options

6. Apply Randomization & Freshness
   ├─ Vary the selection slightly (don't always pick top 1)
   └─ Rotate through content variations (keep it fresh)

Output: [Content ID, Video URL, Expected Time, Difficulty]
```

**Config Parameters (to tune):**
- Spaced repetition intervals: [1d, 3d, 1w, 2w, 1m]
- Mastery thresholds: when to move forward / when to review
- Difficulty adaptation sensitivity: how quickly to adjust
- Algorithm refresh frequency: every session? every hour?

---

### 3. Personal Assistant (PA) Service

**Purpose:** Conversational coaching via WhatsApp

**Components:**

1. **Context Memory:**
   - What has learner learned?
   - What struggles with?
   - Learning pace & pattern
   - Personality signals (tone, engagement style)
   - Current streak & motivation level

2. **Nudge Generator:**
   - Morning nudge: "Today's focus: [skill]. 90 sec?"
   - Spaced review: "You learned X. Time to refresh?"
   - Struggle detection: "That one's tough. Different angle?"
   - Milestone: "You hit 80% on [skill]!"
   - Accountability: "Haven't seen you in 2 days. Miss you?"

3. **Question Answering:**
   - Parse learner question
   - Route to: a) content database (surface relevant video), b) PA explanation (generate response), c) human escalation
   - For (b): Use LLM (Claude/GPT) to generate contextual explanation + relevant video link
   - Remember answer for future similar questions

4. **Human Escalation:**
   - Detect: "I need help," complex questions, emotional moments
   - Route to: instructor/mentor with context
   - Capture instructor's response, use to improve PA knowledge base

5. **Motivation Engine:**
   - Detect when learner is losing motivation (no activity >2 days, recent poor performance)
   - Generate personalized nudge (reference their history, celebrate a win, offer support)
   - Optional: Surface peer support ("Others struggled here too")

---

### 4. Evidence Builder Service

**Purpose:** Auto-generate audit trails & portfolios

**Tracking:**
```
For Every Interaction:
├─ Timestamp
├─ Learner ID
├─ Content consumed
├─ Time spent
├─ Performance (score, difficulty)
├─ KSBs addressed
└─ Growth signal (improvement, consistency, challenge engagement)

Evidence Artifacts (Generated On-Demand):
├─ Competency Summary
│   └─ "Learner is 82% mastered on Standard X.KSBs across Y weeks"
│
├─ Learning Timeline
│   └─ Chronological record of every interaction, mapped to KSBs
│
├─ Mastery Progression
│   └─ Graph: skill progression over time
│
├─ Engagement Pattern
│   └─ Consistency, time investment, practice habits
│
├─ Challenge Engagement
│   └─ Optional difficulty attempts (signals depth vs. checkbox)
│
├─ Peer Comparison (Optional)
│   └─ "In top 10% of your cohort on this skill"
│
└─ EPA Readiness Assessment
    └─ "Predicted to Pass. Gaps: [if any]. Ready to proceed?"
```

**Format:**
- JSON (machine-readable for EPAO systems)
- PDF (human-readable for printout)
- QR code (portable credential)

---

## Data Flow Example

**Learner Opens App (Morning):**

```
1. App sends: GET /api/v1/feed (learner_id, session_token)

2. Backend:
   ├─ Verify auth token
   ├─ Get learner context (role, cohort, competency map)
   ├─ Run Content Algorithm Service
   │   └─ Returns top 5 content pieces for today
   ├─ Check streak status (did they miss yesterday? reset or maintain?)
   ├─ Get PA nudge for today
   └─ Return: {feed: [...], streak: N, daily_nudge: "..."}

3. App displays:
   ├─ Streak badge (14 days 🔥)
   ├─ Feed: [Video 1, Video 2, Video 3]
   ├─ Mastery % for today's focus skill
   └─ "Tap video to start (90 sec)"

4. Learner watches video, answers check:

5. App sends: POST /api/v1/interactions
   ├─ learner_id
   ├─ content_id
   ├─ time_spent: 95 (sec)
   ├─ answers: [{ question_id, learner_answer, correct }]
   ├─ difficulty_rating: "good pace"
   └─ timestamp

6. Backend:
   ├─ Log interaction
   ├─ Update competency for related KSBs
   ├─ Increment streak
   ├─ Run algorithm to precompute next feed
   ├─ Log to evidence builder (audit trail updated)
   ├─ Check: is learner ready for advanced content? ready to spiral back?
   └─ Send PA update: "Learner completed [skill], now at 47%"

7. PA (WhatsApp) sends optional nudge:
   ├─ If performance great: "You nailed that! Streak is 15 now 🔥"
   ├─ If performance weak: "That one's tough. Different angle coming up tomorrow?"
   └─ If major milestone: "You hit 50% mastery! 💪"
```

---

## Tech Stack (Recommendations)

**Frontend:**
- React or Vue.js (for PWA, mobile-friendly)
- TailwindCSS or Styled-Components
- Hosted on Vercel or Netlify

**Backend:**
- Node.js + Express / FastAPI (Python)
- Or: Supabase (managed backend + DB)

**Database:**
- PostgreSQL (primary)
- Redis (cache)

**Content Storage:**
- AWS S3 or equivalent

**AI Services:**
- LLM: OpenAI / Anthropic Claude / open-source
- Video: Synthesia / HeyGen / Runway
- Images: DALL-E / Midjourney
- Voice: Eleven Labs / Google Cloud Speech

**Messaging:**
- WhatsApp Business API (for PA)

**Hosting:**
- AWS / Google Cloud / Digital Ocean
- Or: Railway / Render (simpler, cheaper for MVP)

**Analytics:**
- Mixpanel or custom logging (track feature usage, engagement, learning signals)

---

## Security & Compliance

**Data Protection:**
- GDPR compliance (learner data portability, deletion)
- Encrypt PII at rest
- Encrypt data in transit (HTTPS)

**Authentication:**
- JWT tokens with refresh rotation
- Optional SSO integration with provider's system

**Audit Trail:**
- Immutable logs (append-only)
- Timestamps, user actions, data changes
- Retention policy (keep for X years)

**Access Control:**
- Learner sees only their data
- Instructors see cohort/class data
- Admins see all data
- EPAO gets pre-defined export (competency + portfolio only)

---

## Performance Targets (MVP)

- **API Response Time:** <200ms (p95)
- **Feed Load Time:** <1s (first paint)
- **Video Delivery:** <3s start (CDN cached)
- **Concurrent Users:** 1,000+ on day 1, scale to 10,000+
- **Uptime:** 99.5%+ (SLA for production)

*Note: Start with horizontal scaling (more servers), then optimize if needed.*
