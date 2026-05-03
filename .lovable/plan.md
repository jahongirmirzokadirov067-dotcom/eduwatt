## EduWatt Auth + Onboarding + Dashboard Binding

Implement Supabase email/password auth, an onboarding wizard, and bind the Dashboard to live database records.

### 1. Database (migration)

- Add `monthly_records` table (school_profile_id fk, month date, solar_generated_kwh, grid_consumed_kwh, bill_uzs, school_days, created_at).
- Enable RLS on `school_profiles` (currently has none) and `monthly_records`. Policies: users CRUD only their own rows (`user_id = auth.uid()` for school_profiles; via join for monthly_records — store `user_id` directly on `monthly_records` for simplicity).
- Keep existing `school_profiles` columns; add unique constraint on user_id if missing.

### 2. Auth

- Enable email/password (skip auto-confirm so users verify email — but per spec users sign in immediately; will enable auto-confirm to avoid friction since onboarding follows immediately).
- `src/context/AuthContext.jsx`: provider with `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`. Uses `onAuthStateChange` + initial `getSession`.
- `src/components/RequireAuth.tsx`: redirects to `/login` when no user; while loading, render nothing.

### 3. Pages

- `/login` (`src/pages/Login.tsx`): centered 400px card per spec, Sign in / Create account tabs. On signup, signs up + signs in. On signin, queries `school_profiles` for current user; if none → `/onboarding`, else → `/`.
- `/onboarding` (`src/pages/Onboarding.tsx`): 3-step wizard with dot progress. Step 3 submit: insert school_profiles + monthly_records, then navigate `/`.

### 4. Routing

- Wrap routes with `AuthProvider` in `App.tsx`. Public: `/login`. Protected: everything else via `RequireAuth`. Add `/onboarding`.

### 5. Dashboard binding

- New hook `useSchoolData` fetching `school_profiles` (by user_id) + latest `monthly_records` row. Returns KPIs derived per spec, school name, and a `refetch`.
- `KpiRow.tsx`: accept optional KPI data via props OR consume hook; fall back to mockData when empty.
- `Topbar.tsx`: show real school name from hook (fallback to existing "Greenfield Secondary School").
- `DataInput.tsx`: on submit, insert into `monthly_records`, then trigger refetch (use a simple custom event `eduwatt:records-updated` or React Query invalidation — use a lightweight context bus).

### 6. Notes

- Keep all existing design tokens, layout, language/theme contexts intact.
- Wrap providers order: `LanguageProvider > ThemeProvider > AuthProvider > QueryClient > Router`.
- No changes to mockData structure; only used as fallback.

### Files

Created: `src/context/AuthContext.jsx`, `src/components/RequireAuth.tsx`, `src/pages/Login.tsx`, `src/pages/Onboarding.tsx`, `src/hooks/useSchoolData.ts`.
Edited: `src/App.tsx`, `src/components/eduwatt/KpiRow.tsx`, `src/components/eduwatt/Topbar.tsx`, `src/pages/DataInput.tsx`, `src/i18n/translations.js` (a few new keys, optional).
Migration: create `monthly_records`, enable RLS + policies on both tables.
