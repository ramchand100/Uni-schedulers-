# Uni Schedulers

A university timetable app for Pakistani students, in the spirit of Saturn: build your class schedule, get reminders before class, add friends, and see when you're free together.

## Stack

- **App**: Expo (React Native + TypeScript), Expo Router, TanStack Query, React Hook Form + Zod
- **Backend**: Supabase (Postgres, Auth, Row Level Security)
- **Reminders**: expo-notifications (local, weekly, per class session)

## Getting started

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (the free tier is enough).
2. **Run the migration**: in the Supabase SQL editor (or via the Supabase CLI), run `supabase/migrations/0001_init.sql`. This creates the schema, Row Level Security policies, and the `search_users` / `get_profile_summaries` RPCs the app depends on.
3. **Set your environment variables**: copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings → API in the Supabase dashboard):
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. **Install dependencies and start the app**:
   ```
   npm install
   npx expo start
   ```
   Scan the QR code with Expo Go, or press `a`/`i` for an Android/iOS simulator.

## Project layout

- `app/` — Expo Router screens, grouped by auth state: `(auth)`, `(onboarding)`, `(app)` (the four-tab authenticated app).
- `src/components/` — reusable UI (`ui/`), schedule grid pieces (`schedule/`), friend cards (`friends/`), form inputs (`forms/`).
- `src/hooks/` — data hooks (courses, semesters, friends, notifications), one per concern.
- `src/lib/` — pure logic (time/interval math, free-time overlap, reminder scheduling) plus the Supabase client and API helpers.
- `supabase/migrations/0001_init.sql` — the full schema and RLS policies.

## Testing

- `npm test` runs the unit tests for the pure logic in `src/lib` (interval math, free-time overlap, reminder time computation).
- The migration's RLS policies were verified against a local Postgres instance during development (owner/friend/stranger visibility, friend-request permissions) — see the test scenarios described in the commit history for the exact checks. Before shipping, re-run an equivalent check against your live Supabase project: confirm a non-friend's access token gets zero rows from `courses`/`class_sessions`, and that only the request's addressee can accept a friend request.

## Known limitations / follow-ups

- **Password reset**: `resetPasswordForEmail` is wired up, but completing a reset requires configuring a redirect URL in your Supabase project's Auth settings and building a screen to handle the deep link — not included in this pass.
- **Notifications on Android**: local notification scheduling works in an EAS development build; Expo Go has some platform limitations for scheduled notifications on Android.
- **Semester switching**: only one semester can be "active" at a time per user; switching is a manual toggle on the Semesters screen, not date-based.
