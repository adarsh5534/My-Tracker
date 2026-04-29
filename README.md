# LiftLog

LiftLog is a workout tracker MVP built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase Auth/PostgreSQL.

## Features

- Email/password authentication with protected routes
- Dashboard with last workout summary and next-workout recommendation
- Workout plans page for building Push, Pull, Legs, or custom templates
- New workout flow with body-part selection, exercise selection, and set logging
- User-created exercises attached to workout plans instead of a fixed SQL seed list
- Last-session preload plus quick actions for `Repeat last set`, `+2.5kg`, and `+1 rep`
- Workout history with expandable exercise detail
- Exercise progress cards showing PRs and improvement vs previous session

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and add your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. In Supabase SQL Editor, run the schema in [supabase/schema.sql](/C:/Users/adarsh.ipe/Desktop/my-tracker/supabase/schema.sql).

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Project structure

- [app](/C:/Users/adarsh.ipe/Desktop/my-tracker/app)
- [components](/C:/Users/adarsh.ipe/Desktop/my-tracker/components)
- [lib](/C:/Users/adarsh.ipe/Desktop/my-tracker/lib)
- [types](/C:/Users/adarsh.ipe/Desktop/my-tracker/types)

## Notes

- Supabase automatically creates auth users; the `public.users` table mirrors them via trigger.
- Workout saving uses the `create_workout_with_sets` PostgreSQL function so workout, exercise logs, and sets are inserted transactionally.
- Recommendation logic lives in [lib/recommendations.ts](/C:/Users/adarsh.ipe/Desktop/my-tracker/lib/recommendations.ts).
