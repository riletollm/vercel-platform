# Vercel Platform

A monorepo hosting multiple web applications deployed via Vercel.

## Apps

- **token-analysis-dashboard** — Token usage analysis dashboard
- **research-viewer** — Research results frontend

## Structure

```
vercel-platform/
├── dashboard/              # Token analysis dashboard
├── research-viewer/        # Research frontend
├── vercel.json            # Vercel monorepo config
└── README.md
```

## Deployment

Both apps are independently deployable via Vercel. Push to `main` to trigger builds.

## Environment Variables

Stored in Vercel project settings (encrypted). Never commit `.env` files.

## Auth

Centralized Supabase auth for all apps.
