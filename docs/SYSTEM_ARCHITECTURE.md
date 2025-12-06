# System Architecture

## Overview

The Email Incident Logging & Summarization Tool is a full-stack web application that processes email files, generates AI summaries, and stores them as searchable incident records.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    React Frontend (Vite)                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │    │
│  │  │Dashboard │ │ Upload   │ │ Search   │ │ Incident     │    │    │
│  │  │ Page     │ │ Zone     │ │ Filters  │ │ Detail       │    │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘    │    │
│  │                      │                                       │    │
│  │              ┌───────┴───────┐                               │    │
│  │              │ Zustand Store │                               │    │
│  │              └───────────────┘                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Layer                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  Express.js Backend                          │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │                  Middleware                           │   │    │
│  │  │  CORS │ Helmet │ Rate Limit │ Validation │ Logging   │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │    │
│  │  │ Upload   │ │ Incident │ │Summarize │ │ Health       │   │    │
│  │  │Controller│ │Controller│ │Controller│ │ Controller   │   │    │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────────┘   │    │
│  │       │            │            │                          │    │
│  │  ┌────┴────────────┴────────────┴─────────────────────┐   │    │
│  │  │                    Services                         │   │    │
│  │  │  ┌──────────────┐ ┌─────────────┐ ┌─────────────┐  │   │    │
│  │  │  │Email Parser  │ │AI Summarizer│ │Incident Svc │  │   │    │
│  │  │  │(eml, msg)    │ │(OpenRouter, │ │(CRUD)       │  │   │    │
│  │  │  │              │ │ Gemini)     │ │             │  │   │    │
│  │  │  └──────────────┘ └─────────────┘ └─────────────┘  │   │    │
│  │  └────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ Prisma ORM
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Layer                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      PostgreSQL                              │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │                    incidents                          │   │    │
│  │  │  id │ subject │ sender │ received │ summary │ body   │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  │  ┌──────────────────────────────────────────────────────┐   │    │
│  │  │                  system_config                        │   │    │
│  │  │  id │ key │ value │ created │ updated                │   │    │
│  │  └──────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ External APIs
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       External Services                              │
│  ┌─────────────────────┐         ┌─────────────────────┐            │
│  │     OpenRouter      │         │    Google Gemini    │            │
│  │   (Primary AI)      │         │   (Fallback AI)     │            │
│  └─────────────────────┘         └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                        Frontend                                │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  Components │  │   Pages     │  │   Store     │           │
│  │  ──────────  │  │  ─────────  │  │  ─────────  │           │
│  │  Layout      │  │  Dashboard  │  │  Zustand    │           │
│  │  DragDrop    │  │  Incident   │  │  State      │           │
│  │  Table       │  │  Detail     │  │  Manager    │           │
│  │  Search      │  │             │  │             │           │
│  │  Stats       │  │             │  │             │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
│         └────────────────┼────────────────┘                   │
│                          │                                    │
│                   ┌──────┴──────┐                             │
│                   │  API Utils  │                             │
│                   │  (Axios)    │                             │
│                   └─────────────┘                             │
└───────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────────┐
│                         Backend                                │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Routes   │──│Controllers│──│  Services  │──│   Prisma  │  │
│  │          │  │           │  │            │  │   Client  │  │
│  │ /upload  │  │ Upload    │  │EmailParser │  │           │  │
│  │/incidents│  │ Incident  │  │AISummarize │  │           │  │
│  │/summarize│  │ Summarize │  │ Incident   │  │           │  │
│  │ /health  │  │ Health    │  │            │  │           │  │
│  └──────────┘  └───────────┘  └────────────┘  └───────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                    Middleware                          │   │
│  │  errorHandler │ validate │ upload │ rateLimit │ cors  │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

## Sequence Diagrams

### Email Upload Flow

```
┌──────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐     ┌─────┐     ┌──────┐
│Client│     │ Frontend │     │ Backend │     │AI Service│     │Prisma│     │  DB  │
└──┬───┘     └────┬─────┘     └────┬────┘     └────┬─────┘     └──┬───┘     └──┬───┘
   │              │                │               │              │            │
   │ Drop File    │                │               │              │            │
   │─────────────>│                │               │              │            │
   │              │                │               │              │            │
   │              │ POST /upload   │               │              │            │
   │              │───────────────>│               │              │            │
   │              │                │               │              │            │
   │              │                │ Parse Email   │              │            │
   │              │                │──────┐        │              │            │
   │              │                │      │        │              │            │
   │              │                │<─────┘        │              │            │
   │              │                │               │              │            │
   │              │                │ Summarize     │              │            │
   │              │                │──────────────>│              │            │
   │              │                │               │              │            │
   │              │                │   Summary     │              │            │
   │              │                │<──────────────│              │            │
   │              │                │               │              │            │
   │              │                │ Create Incident              │            │
   │              │                │──────────────────────────────>│            │
   │              │                │               │              │            │
   │              │                │               │              │ INSERT     │
   │              │                │               │              │───────────>│
   │              │                │               │              │            │
   │              │                │               │              │   OK       │
   │              │                │               │              │<───────────│
   │              │                │               │              │            │
   │              │                │      Incident Created        │            │
   │              │                │<─────────────────────────────│            │
   │              │                │               │              │            │
   │              │   Incident     │               │              │            │
   │              │<───────────────│               │              │            │
   │              │                │               │              │            │
   │ Show Success │                │               │              │            │
   │<─────────────│                │               │              │            │
```

### Incident List Flow

```
┌──────┐     ┌──────────┐     ┌─────────┐     ┌──────┐     ┌──────┐
│Client│     │ Frontend │     │ Backend │     │Prisma│     │  DB  │
└──┬───┘     └────┬─────┘     └────┬────┘     └──┬───┘     └──┬───┘
   │              │                │              │            │
   │ Load Page    │                │              │            │
   │─────────────>│                │              │            │
   │              │                │              │            │
   │              │GET /incidents  │              │            │
   │              │───────────────>│              │            │
   │              │                │              │            │
   │              │                │ Find All     │            │
   │              │                │─────────────>│            │
   │              │                │              │            │
   │              │                │              │ SELECT     │
   │              │                │              │───────────>│
   │              │                │              │            │
   │              │                │              │  Results   │
   │              │                │              │<───────────│
   │              │                │              │            │
   │              │                │  Incidents   │            │
   │              │                │<─────────────│            │
   │              │                │              │            │
   │              │ Incidents List │              │            │
   │              │<───────────────│              │            │
   │              │                │              │            │
   │ Render Table │                │              │            │
   │<─────────────│                │              │            │
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Production Environment                           │
│                                                                      │
│  ┌────────────────┐                                                 │
│  │   CDN/Proxy    │                                                 │
│  │  (Cloudflare)  │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│          ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Load Balancer                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│          │                           │                              │
│          ▼                           ▼                              │
│  ┌───────────────┐           ┌───────────────┐                     │
│  │   Frontend    │           │   Backend     │                     │
│  │   Container   │           │   Container   │                     │
│  │   (Nginx)     │           │   (Node.js)   │                     │
│  │   Port: 80    │           │   Port: 5000  │                     │
│  └───────────────┘           └───────┬───────┘                     │
│                                      │                              │
│                                      ▼                              │
│                          ┌───────────────────┐                     │
│                          │    PostgreSQL     │                     │
│                          │    (Managed)      │                     │
│                          │ Neon/Supabase/RDS │                     │
│                          └───────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      External Services                               │
│                                                                      │
│  ┌───────────────┐                    ┌───────────────┐             │
│  │  OpenRouter   │                    │    Gemini     │             │
│  │    API        │                    │     API       │             │
│  └───────────────┘                    └───────────────┘             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 | UI Framework |
| Frontend | Vite | Build Tool |
| Frontend | TailwindCSS | Styling |
| Frontend | Zustand | State Management |
| Frontend | React Query | Data Fetching |
| Backend | Express.js | API Server |
| Backend | TypeScript | Type Safety |
| Backend | Prisma | ORM |
| Backend | Zod | Validation |
| Backend | Winston | Logging |
| Database | PostgreSQL | Primary Database |
| AI | OpenRouter | Primary AI Provider |
| AI | Gemini | Fallback AI Provider |
| DevOps | Docker | Containerization |
| DevOps | GitHub Actions | CI/CD |

## Security Considerations

1. **API Keys** - Stored as environment variables
2. **CORS** - Configured for specific origins
3. **Rate Limiting** - 100 requests/15 min per IP
4. **Helmet** - Security headers enabled
5. **Input Validation** - Zod schemas for all inputs
6. **File Validation** - Only .msg/.eml accepted
