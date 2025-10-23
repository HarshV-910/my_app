# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Supabase Setup (2 min)
```bash
# 1. Create project at supabase.com
# 2. Run SQL from DEPLOYMENT.md Step 2
# 3. Create 'sainath-uploads' storage bucket (public)
# 4. Copy Project URL + Anon Key
```

### 2. Local Dev (2 min)
```bash
# Create .env.local
echo "VITE_SUPABASE_URL=your-url" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your-key" >> .env.local

npm install
npm run dev
```

### 3. Create Host User (1 min)
```bash
# 1. Sign up at localhost:3000
# 2. In Supabase Dashboard → profiles table
# 3. Change your user: role='host', status='approved'
# 4. Log in!
```

## 🌐 Deploy to Vercel

```bash
git push origin main
# Then: vercel.com/new → Import repo → Add env vars → Deploy
```

## 📦 Key Environment Variables

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🔑 Default First User

After signup, manually promote in Supabase:
- Email: harshvekariya910@gmail.com
- Role: host
- Status: approved

## 📚 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.
