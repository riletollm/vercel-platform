# How to Import LMS Disruptor Docs to Research Viewer

Your project documentation is ready to be added to the Research Viewer app. Here are three ways to do it:

---

## Option 1: Quick SQL Insert (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vcwkgxwnzayxhysfjeqw`
3. Go to **SQL Editor** → **New Query**
4. Copy and paste the contents of `migrate-to-research-viewer.sql`
5. Replace the `[PASTE FULL CONTENT OF X.md HERE]` placeholders with the actual file contents
6. Click **Run**

---

## Option 2: Node.js Migration Script

If you have Node.js installed:

```bash
cd /root/.openclaw/workspace/projects/lms-disruptor

# Get your Supabase Service Role Key:
# 1. Go to Supabase Dashboard → Settings → API
# 2. Copy the "Service Role Key" (not the anon key)

SUPABASE_KEY="your-service-role-key-here" \
SUPABASE_URL="https://vcwkgxwnzayxhysfjeqw.supabase.co" \
node migrate-to-research-viewer.js
```

---

## Option 3: Supabase REST API (curl)

```bash
# Get your service role key from Supabase Dashboard

curl -X POST "https://vcwkgxwnzayxhysfjeqw.supabase.co/rest/v1/research_projects" \
  -H "apikey: your-service-role-key" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "lms-disruptor",
    "project_name": "LMS Disruptor: Conversational Learning Platform",
    "overview": "A disruptive learning platform..."
  }'
```

---

## Verify It Worked

Once imported, visit:
**https://research-viewer-letos-projects-a7d7dbf1.vercel.app**

You should see "LMS Disruptor" in the project list with all 5 documents:
- Vision
- Learner Journey Map
- Technical Architecture
- MVP Roadmap
- Project Overview

---

## Files in This Directory

- **VISION.md** — The big picture
- **LEARNER_JOURNEY.md** — User experience walkthrough
- **ARCHITECTURE.md** — Technical blueprint
- **MVP_ROADMAP.md** — 6-week build plan
- **README.md** — Quick overview
- **migrate-to-research-viewer.js** — Automated Node.js script
- **migrate-to-research-viewer.sql** — SQL commands (manual)
- **SUPABASE_MIGRATION.json** — JSON data format

---

## Troubleshooting

**"Invalid API key" error:**
- Make sure you're using the **Service Role Key**, not the Anon Key
- Service Role Key is in Settings → API (requires admin access)

**"Table not found" error:**
- The `research_projects` and `research_documents` tables may not exist
- Create them manually in Supabase or contact the app owner

**Files too large:**
- If your database has character limits, split large documents across multiple database records

---

## Need Help?

Check the research-viewer app code at:
`/root/.openclaw/workspace/vercel-platform/research-viewer/server.js`
