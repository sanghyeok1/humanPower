# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 (App Router) job board application for construction workers in Bucheon, South Korea. It connects job seekers with construction employers and displays location-based partner advertisements (e.g., tool shops, material suppliers).

**Tech Stack:**
- Next.js 15 with React 19, TypeScript, App Router
- JWT-based authentication (jsonwebtoken)
- Mock in-memory database (no real DB yet)
- Server-Side Rendering (SSR) and Server Components
- Client-side caching for partner ads (sessionStorage + global cache)

## Development Commands

```bash
# Start development server (default port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Project Structure

```
app/                    # Next.js App Router pages and API routes
  api/                  # API endpoints
    auth/               # Authentication endpoints (login, logout, phone verification)
    partners/           # Partner ads API (location-based)
    postings/           # Job postings API
    signup/             # User registration
    geocode/            # Geocoding service
    me/                 # Current user info
  [id]/                 # Dynamic routes
  page.tsx              # Route pages
lib/                    # Server-side utilities
  mockdb.ts             # In-memory database (accounts, partners, postings)
  auth.ts               # JWT signing and verification, server-side user retrieval
  geo.ts                # Haversine distance calculation
components/             # React components (mostly client-side)
  PartnerBanner.tsx     # Location-based partner ads with aggressive caching
  BoardBrowser.tsx      # Job board filtering UI
  Header.tsx            # App header with auth state
  Footer.tsx            # App footer
data/                   # Static data
  postings.ts           # Job postings data
types.ts                # Shared TypeScript types
styles/                 # Global CSS
public/                 # Static assets
```

## Key Architecture Patterns

### Authentication Flow

- JWT stored in HTTP-only cookie (`hp_token`)
- `lib/auth.ts` provides `getServerAccount()` for Server Components and API routes
- `signToken()` creates JWT with 7-day expiry
- Mock accounts in `lib/mockdb.ts` with plaintext passwords (demo only)
- Account roles: "seeker" (job seeker) or "employer"

### Mock Database

`lib/mockdb.ts` contains three in-memory arrays:
- `accounts[]`: User accounts with optional location (lat/lng)
- `partners[]`: Partner businesses with coordinates (12 entries)
- `postings[]`: Job postings with category, location (dong), dates (13 entries)

**Categories:**
- `rc`: 철근/형틀/콘크리트 (rebar/formwork/concrete)
- `int`: 내부마감 (interior finish)
- `mech`: 설비/전기/배관 (MEP)

**Locations (dong):** 춘의동, 신중동, 중동, 원미동, 소사동

### Partner Ads Caching Strategy

`components/PartnerBanner.tsx` implements a multi-layer cache to prevent redundant API calls:
1. **Global in-memory cache** (`window.__hpPartnerCache`)
2. **sessionStorage cache** (10-minute TTL)
3. **Location-based keying**: Cache key is `lat,lng` rounded to 4 decimals
4. **Coordinate-based fetch**: Only fetches if user location or default location changes
5. **SSR-friendly**: Account location passed as prop from `layout.tsx`

This ensures partner ads don't refetch when navigating between pages or changing filters.

### API Routes

All API routes return JSON. Key endpoints:

**GET /api/partners?lat=...&lng=...**
- Returns partners sorted by distance from given coordinates
- Uses Haversine formula from `lib/geo.ts`

**GET /api/postings?category=...**
- Returns job postings, optionally filtered by category

**POST /api/auth/login**
- Accepts username/password, returns JWT in cookie

**GET /api/me**
- Returns current authenticated user or null

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Strict mode enabled
- ESNext module resolution with bundler mode

## Common Development Patterns

### Adding a New API Route

1. Create `app/api/[name]/route.ts`
2. Export `GET`, `POST`, etc. as async functions
3. Use `NextRequest`/`NextResponse` from `next/server`
4. Add `export const runtime = "nodejs"` if needed

### Adding a New Page

1. Create `app/[path]/page.tsx`
2. Export default async function for Server Component
3. Access `searchParams` as Promise in Next.js 15
4. Use `getServerAccount()` for auth state

### Working with Mock Data

- Modify arrays directly in `lib/mockdb.ts`
- Use utility functions: `findAccountByUsername()`, `findAccountById()`, `setAccountLocation()`
- No persistence between server restarts

### Client Component Patterns

- Use `"use client"` directive at top
- Import types from `@/lib/auth` (e.g., `MeAccount`)
- Use `sessionStorage` for client-side caching
- Fetch API with `cache: "no-store"` to bypass Next.js cache

## Environment Variables

Stored in `.env.local`:
- `AUTH_JWT_SECRET`: JWT signing secret
- `API_BASE`: Backend API URL (currently unused, mock data only)
- `KAKAO_REST_KEY`: Kakao Maps API key (placeholder, needs configuration)

## Known Issues & TODOs

- No real database (using in-memory mock)
- Passwords stored in plaintext (demo only)
- Phone verification endpoints are stubs
- Geocoding API not fully implemented
- Korean date handling assumes system time is KST
- Partner logo images not implemented (placeholder in schema)
