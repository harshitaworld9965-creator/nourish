# Nourish

Personal nutrition, weight and fitness tracker. React + Vite, vanilla CSS Modules, installable PWA,
works offline, optional sync between devices through Supabase.

## Run locally

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev -- --host  # also reachable from your phone on the same Wi-Fi
npm run build && npm run preview   # production build with the service worker
```

The service worker only runs in the production build (`build` + `preview`, or once deployed).

## How the data works

| Concept | Where | Notes |
| --- | --- | --- |
| Original meal plan | `src/data/defaultMealPlan.js` | Hardcoded, never written to |
| Built-in foods | `src/data/foodDatabase.js` | Estimates; your edits are stored as overrides |
| Saved templates | storage → `templates` | Made with “Save as template” |
| A day’s meals | storage → `days["2026-11-01"]` | Created from the active template the first time the date is opened |

Editing Monday only changes Monday. “Restore default” on a meal or a day pulls from the hardcoded
plan; Settings → Restore default meal plan switches new days back to it.

Calories and protein count meals you’ve **marked eaten**; the paler bar shows what the rest of the plan adds.

## Sync across phone and tablet (Supabase)

Without these steps the app works fully, but each device keeps its own data.

1. **Create a project** at supabase.com (free tier is plenty).
2. **Create the table:** SQL Editor → paste `supabase/schema.sql` → Run.
3. **Use a code instead of a link in the sign-in email** (the installed app can’t receive magic links):
   Authentication → Email Templates → *Magic Link* → put `{{ .Token }}` in the body, e.g.
   `Your Nourish code is {{ .Token }}`. Do the same for *Confirm signup*.
4. **Allow your site:** Authentication → URL Configuration → set Site URL to your deployed URL
   (and add `http://localhost:5173` under Redirect URLs for development).
5. **Add the keys:** copy `.env.example` to `.env` and fill in the Project URL and the
   publishable (anon) key from Project Settings → API Keys. Never use the secret / service_role key.
6. Restart `npm run dev`. Settings → Sync across devices → enter your email → enter the code.

Sign in with the same email on every device. Sync runs on sign-in, when the app comes back to the
foreground, when the network returns, every minute, and two seconds after an edit. Each day is its own
record, so editing different days on two devices never conflicts; if both edit the *same* record, the
later edit wins.

The default Supabase email sender is rate-limited (a few emails per hour). Fine for one person; add
custom SMTP under Authentication → Emails if you hit the limit.

## Deploy (Vercel)

1. Push this folder to a GitHub repository.
2. vercel.com → Add New Project → import the repo. Framework preset: Vite.
3. Environment Variables: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`.
4. Deploy. `vercel.json` already sends every route to `index.html`.
5. Put the Vercel URL into Supabase’s Site URL (step 4 above).

## Install on devices

- **Android (Chrome):** open the site → Install banner on Today, Settings → Install, or ⋮ → Install app.
- **iPad / iPhone (Safari):** Share → Add to Home Screen.

## Project structure

```
src/
  app/          App.jsx (router + providers)
  data/         defaultMealPlan.js, foodDatabase.js, defaultSettings.js
  store/        reducer, provider, initial state, sync engine
  hooks/        useDay, useFoods, useWeight, useWorkouts, useToday, useInstallPrompt
  utils/        nutrition, dates, analytics, storage, export/import
  lib/          supabase client (null when not configured)
  components/   ui/ primitives, AppShell, NavBar, MealSection, ItemEditor, FoodPicker, charts…
  pages/        Dashboard, Diary, FoodDatabase, Weight, Activity, Analytics, Settings
  styles/       reset, tokens, typography, global
supabase/schema.sql
```
