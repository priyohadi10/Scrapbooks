# Supabase + Vercel Connection Guide

## Your Supabase Project Info
From your screenshot:
- **Project URL**: `https://fkepvngnykboujkpcvw.supabase.co`
- **Status**: Healthy
- **Region**: Southeast Asia (Singapore)
- **Compute**: Nano (free tier)

---

## Step 1: Get Your Supabase API Keys

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Click on your project **"scrapbook"**
3. In the left sidebar, click **Project Settings** (gear icon at bottom)
4. Click **API** in the sidebar
5. You will see:
   - **Project URL**: `https://fkepvngnykboujkpcvw.supabase.co`
   - **anon public**: `eyJhbG...` (long string)
   - **service_role secret**: `eyJhbG...` (long string - KEEP SECRET!)

Copy these 3 values - you'll need them for Vercel.

---

## Step 2: Add Environment Variables in Vercel

From your Vercel screenshot, I can see you already have the project set to **Next.js** and **Root Directory: ./** which is correct.

Now fix the Environment Variables:

### In Vercel Dashboard:
1. Go to your project on Vercel
2. Click **Settings** tab
3. Click **Environment Variables** in left sidebar
4. You should see the error: "Environment variable 'https://your-project.supabase.co' is invalid"
   - This means you entered the URL as the **Key** instead of the **Value**

### Correct Way to Add Variables:

Click **+ Add More** and add these EXACTLY:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fkepvngnykboujkpcvw.supabase.co` | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key-from-supabase` | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key-from-supabase` | Production + Preview |

**IMPORTANT**: 
- The **Key** field must be the variable NAME (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
- The **Value** field must be the actual URL/key
- Select **Production and Preview** for all
- Click **Save**

---

## Step 3: Run Database Migration in Supabase

1. In Supabase Dashboard, click **SQL Editor** in left sidebar
2. Click **New query**
3. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. This creates: `projects`, `assets`, `export_jobs` tables + RLS policies

---

## Step 4: Set Up Storage Buckets

1. In Supabase Dashboard, click **Storage** in left sidebar
2. Click **New bucket**
3. Create bucket named: `assets`
4. Set it to **Public**
5. Create another bucket named: `projects`
6. Set it to **Public**

---

## Step 5: Deploy to Vercel

1. In Vercel Dashboard, make sure:
   - Framework Preset: **Next.js** ✓
   - Root Directory: **./** ✓
   - Build Command: `npm run build` or `next build`
   - Output Directory: `Next.js default`

2. Click **Deploy**

3. Wait for build to complete

---

## Step 6: Verify Connection

After deployment:
1. Visit your deployed URL
2. You should see the Dashboard (not 404)
3. Click **Create New Project**
4. If it saves without error, Supabase is connected!

---

## Troubleshooting

### If you still get 404:
- Check that `app/page.tsx` exists (redirects to /dashboard)
- Check that `app/dashboard/page.tsx` exists
- In Vercel: Settings → General → Framework Preset MUST be "Next.js"

### If Supabase connection fails:
- Verify environment variables are spelled correctly
- `NEXT_PUBLIC_SUPABASE_URL` must start with `https://`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be the **anon** key (not service_role)
- Redeploy after fixing variables

### If database tables don't exist:
- Run the SQL migration again in Supabase SQL Editor
- Check for any SQL errors

---

## Alternative: Use Vercel Supabase Integration (Easier)

Instead of manual setup, you can use the official integration:

1. In Vercel Dashboard → your project → **Integrations** tab
2. Click **Browse Marketplace**
3. Search for **Supabase**
4. Click **Add Integration**
5. Select your Supabase project
6. It will auto-inject all environment variables!

This is the recommended way as it handles all variables automatically.
