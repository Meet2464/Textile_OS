# TextileApp — Supabase Setup Guide

## 1. Get Your API Keys

Go to: https://supabase.com/dashboard/project/mdiuegoonztodwvfhdmo/settings/api

Copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key (starts with `eyJ...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key (starts with `eyJ...`) → `SUPABASE_SERVICE_ROLE_KEY`

Update your `.env.local` file with the correct values.

⚠️  The anon key must start with `eyJ` (it's a JWT). If it looks like `sb_publishable_...`, that's wrong — use the "anon public" JWT from the API settings page.

---

## 2. Run the Full Migration SQL

Go to: https://supabase.com/dashboard/project/mdiuegoonztodwvfhdmo/sql/new

Copy the contents of `supabase/full_migration.sql` and run it.

If you get "already exists" errors, your DB was already set up. That's fine — just continue.

---

## 3. Disable Email Confirmation (for development)

By default, Supabase requires users to confirm their email before logging in.

To disable for local dev:
1. Go to: https://supabase.com/dashboard/project/mdiuegoonztodwvfhdmo/auth/providers
2. Click on **Email** provider
3. Toggle OFF **"Confirm email"**
4. Save

This lets users register and immediately log in without email verification.

---

## 4. Set Redirect URLs

1. Go to: https://supabase.com/dashboard/project/mdiuegoonztodwvfhdmo/auth/url-configuration
2. Add these to **Redirect URLs**:
   - `http://localhost:3000/**`
   - Your production URL if deployed

---

## 5. Verify the Setup

Run the app with `npm run dev` and try:
1. **Register** a new company (go to /register)
2. **Login** with the same credentials (go to /login)
3. Should redirect to **Onboarding** page first time

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Invalid API key" | Check your anon key in `.env.local` — must be a JWT |
| "Email not confirmed" | Disable email confirmation in Auth settings |
| "Column not found" | Run the full_migration.sql again |
| Login works but no redirect | Check browser console for JS errors |
