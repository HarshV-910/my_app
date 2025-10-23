# 🚀 Pre-Deployment Checklist

Use this checklist before deploying to production.

## ✅ Supabase Setup

- [ ] Created Supabase project
- [ ] Ran complete SQL migration script (all tables + trigger)
- [ ] Created `sainath-uploads` storage bucket
- [ ] Made bucket **public**
- [ ] Copied Project URL
- [ ] Copied Anon Key
- [ ] (Optional) Disabled email confirmations for testing

## ✅ Local Development

- [ ] Created `.env.local` with both env vars
- [ ] Ran `npm install`
- [ ] Ran `npm run dev` successfully
- [ ] Created test user via signup
- [ ] Promoted test user to `host` in Supabase
- [ ] Logged in as host successfully
- [ ] Created test event
- [ ] Created test item
- [ ] Tested order creation
- [ ] Tested file upload
- [ ] Verified realtime updates work

## ✅ Code Quality

- [ ] Ran `npm run build` - builds successfully
- [ ] No critical TypeScript errors (ignore "never" type warnings)
- [ ] All services created and properly typed
- [ ] AppContext properly handles async operations
- [ ] Error handling in place with notifications
- [ ] Loading states display correctly

## ✅ GitHub & Version Control

- [ ] Committed all changes
- [ ] `.env.local` is in `.gitignore` (should already be via `*.local`)
- [ ] `node_modules` in `.gitignore`
- [ ] Pushed to GitHub main branch

## ✅ Vercel Deployment

- [ ] Imported repository to Vercel
- [ ] Added `VITE_SUPABASE_URL` environment variable
- [ ] Added `VITE_SUPABASE_ANON_KEY` environment variable
- [ ] Deployment succeeded
- [ ] Visited production URL

## ✅ Production Testing

- [ ] Signed up new user on production
- [ ] Promoted user to host in Supabase
- [ ] Logged in on production
- [ ] Created event on production
- [ ] Created item on production
- [ ] Created order on production
- [ ] Uploaded file on production
- [ ] Verified realtime sync on production (open two browsers)

## ✅ Post-Deployment

- [ ] Documented production URL
- [ ] Created first actual host user
- [ ] (Optional) Enabled email confirmations
- [ ] (Optional) Set up Row Level Security (RLS) policies
- [ ] (Optional) Set up database backups
- [ ] (Optional) Configure custom domain in Vercel

## 🔒 Security (Production)

For production deployment, consider:

- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Set up proper storage bucket policies
- [ ] Enable email confirmations
- [ ] Configure rate limiting
- [ ] Set up monitoring/alerts
- [ ] Review Supabase Auth settings
- [ ] Add CAPTCHA to signup (if needed)

## 📊 Monitoring

- [ ] Check Vercel deployment logs
- [ ] Check Supabase database logs
- [ ] Check Supabase auth logs
- [ ] Monitor API usage in Supabase dashboard

---

## ⚠️ Common Issues

**Build fails on Vercel**
→ Double-check environment variables are set

**Can't login after deployment**
→ Check user status is "approved" in Supabase profiles table

**Realtime not working**
→ Enable replication for tables in Supabase Dashboard → Database → Replication

**Files not uploading**
→ Verify bucket is public and exists

---

## 📞 Need Help?

- 📚 See `DEPLOYMENT.md` for detailed instructions
- 📚 See `QUICKSTART.md` for quick setup
- 📚 See `MIGRATION_SUMMARY.md` for what changed
- 📧 Contact: harshvekariya910@gmail.com

---

**Ready to deploy?** Start with `DEPLOYMENT.md` → Part 1!
