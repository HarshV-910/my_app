# Sainath App - Deployment Guide

## 🚀 Complete Deployment Instructions

This guide covers migrating from localStorage to Supabase and deploying to Vercel.

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Project Name**: sainath-inventory
   - **Database Password**: (Save this securely)
   - **Region**: Choose closest to your users
4. Click **Create Project** (takes ~2 minutes)

### Step 2: Run Database Migration

1. Once project is ready, go to **SQL Editor**
2. Click **New Query**
3. Paste and execute this SQL:

```sql
-- Create custom types for better data integrity
CREATE TYPE public.payment_status AS ENUM ('Baki', 'Cash', 'Online');
CREATE TYPE public.user_role AS ENUM ('host', 'member');
CREATE TYPE public.user_status AS ENUM ('pending', 'approved');

-- Create a table to store user profiles, extending Supabase's built-in auth
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  status user_status NOT NULL DEFAULT 'pending'
);

-- Create a table for events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for items
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  available_stock_kg NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  quantity_kg NUMERIC(10, 2) NOT NULL,
  amount_inr NUMERIC(10, 2) NOT NULL,
  payment_status payment_status DEFAULT 'Baki',
  verified BOOLEAN DEFAULT false,
  edited BOOLEAN DEFAULT false,
  date_time TIMESTAMPTZ DEFAULT now()
);

-- Create a table for expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  added_by_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount_inr NUMERIC(10, 2) NOT NULL,
  verified BOOLEAN DEFAULT false,
  date_time TIMESTAMPTZ DEFAULT now()
);

-- Create a table for notes
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  content TEXT,
  image_urls TEXT[],
  date_time TIMESTAMPTZ DEFAULT now()
);

-- Create a table for stored files
CREATE TABLE public.stored_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT now()
);

-- IMPORTANT: This function automatically creates a profile when a new user signs up.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', 'member');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link the function to the auth system
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

4. Click **Run** - you should see "Success. No rows returned"

### Step 3: Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Enter bucket name: `sainath-uploads`
4. Toggle **Public bucket** to ON
5. Click **Create bucket**

### Step 4: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

---

## Part 2: Local Development Setup

### Step 1: Configure Environment Variables

1. In your project root, create `.env.local`:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 4 above.

### Step 2: Install and Run

```bash
npm install
npm run dev
```

### Step 3: Create First Host User

1. Open http://localhost:3000
2. Click "Request to join"
3. Fill in your details and submit
4. Go back to Supabase Dashboard → **Table Editor** → **profiles**
5. Find your newly created profile
6. Click to edit and change:
   - `role` from `member` to `host`
   - `status` from `pending` to `approved`
7. Now log in with your credentials

---

## Part 3: Vercel Deployment

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Migrate to Supabase backend"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Connect your GitHub account
   - Select your repository

3. **Configure Project**
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key-here
   ```

5. **Deploy**
   - Click **Deploy**
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (interactive prompts)
vercel

# Set environment variables
vercel env add VITE_SUPABASE_URL production
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your Supabase anon key when prompted

# Deploy to production
vercel --prod
```

---

## Part 4: Post-Deployment Setup

### Create Host User in Production

After deploying, you need to create a host user:

1. Visit your deployed app URL
2. Sign up with your email
3. Go to Supabase Dashboard → **Table Editor** → **profiles**
4. Find your user and update to `host` role and `approved` status

### Optional: Disable Email Confirmation

By default, Supabase sends confirmation emails. To disable for testing:

1. Go to **Authentication** → **Settings**
2. Scroll to "Email Auth"
3. Toggle OFF "Enable email confirmations"
4. Click **Save**

---

## Part 5: Seeding Initial Data (Optional)

To add initial events and items:

1. Go to Supabase **SQL Editor**
2. Run this SQL:

```sql
-- Insert sample events
INSERT INTO public.events (name, year, image_url) VALUES
('Diwali', 2024, 'https://images.unsplash.com/photo-1542866752-45a730a35914?w=400'),
('Raksha Bandhan', 2024, 'https://images.unsplash.com/photo-1597987299991-248de49a78fd?w=400');

-- Get event IDs (run this to see IDs)
SELECT id, name FROM public.events;

-- Insert items (replace 'event-id-here' with actual UUID from above)
INSERT INTO public.items (event_id, name, available_stock_kg) VALUES
('event-id-here', 'Kaju Katli', 50),
('event-id-here', 'Chikki', 100);
```

---

## 🔧 Troubleshooting

### Build Failures

**Error: Missing environment variables**
- Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel
- Variable names must start with `VITE_` for Vite to expose them

**Error: Cannot find module '@supabase/supabase-js'**
- Run `npm install` locally
- Ensure `package.json` includes `"@supabase/supabase-js": "^2.39.0"`

### Authentication Issues

**Error: "Your account is pending approval"**
- Go to Supabase profiles table
- Change user status to `approved`

**Cannot login after signup**
- Check Supabase logs: **Authentication** → **Logs**
- Verify trigger function is created: **Database** → **Functions**

### Storage Issues

**Files not uploading**
- Verify `sainath-uploads` bucket exists
- Ensure bucket is **public**
- Check bucket policies: **Storage** → **Policies**

### Realtime Not Working

- Go to **Database** → **Replication**
- Enable replication for all tables (events, items, orders, expenses, notes)

---

## 📊 Monitoring & Logs

### Vercel Logs
- Go to your project dashboard
- Click **Deployments** → Select deployment → **View Function Logs**

### Supabase Logs
- **Database**: Logs → Postgres Logs
- **Auth**: Authentication → Logs
- **Storage**: Storage → Logs

---

## 🔐 Production Security Checklist

- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Set up proper storage bucket policies
- [ ] Enable email confirmations for production
- [ ] Use Supabase Service Role key only in secure backend (never in frontend)
- [ ] Set up database backups
- [ ] Configure rate limiting in Supabase

---

## 📝 Summary of Changes

What was migrated from localStorage to Supabase:

✅ User authentication (simple hash → Supabase Auth)  
✅ All data storage (localStorage → PostgreSQL tables)  
✅ File uploads (base64 → Supabase Storage)  
✅ Real-time updates (manual refresh → Supabase Realtime)  
✅ Password management (client-side → server-side)  

---

## 🆘 Need Help?

- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Contact: harshvekariya910@gmail.com

---

**Deployment complete! 🎉**
