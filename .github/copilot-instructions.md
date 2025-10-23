<!-- .github/copilot-instructions.md -->

# Sainath_app — Copilot Instructions

AI coding agents: these instructions help you understand this project's architecture and conventions immediately. Keep suggestions consistent with existing patterns.

## Project Overview

- **Type**: Vite + React 19 + TypeScript SPA with Supabase backend
- **Purpose**: Festival-based inventory management for host/member roles
- **Stack**: React, TypeScript, Supabase (PostgreSQL + Auth + Storage + Realtime), Tailwind CSS, Lucide icons
- **Deployment**: Vercel

## Core Architecture

### Backend & Data Flow
- **Backend**: Supabase provides PostgreSQL database, authentication, file storage, and realtime subscriptions
- **Services layer**: `services/` directory contains typed CRUD operations for each table (authService, userService, eventService, itemService, orderService, expenseService, noteService, fileService)
- **Database schema**: See `types/database.ts` for generated Supabase types; `types.ts` for app-level interfaces
- **Authentication**: Supabase Auth (email/password); all new users auto-created as "member" with "pending" status via database trigger

### Frontend State Management
- **Global state**: React Context in `context/AppContext.tsx` manages all app state and coordinates service calls
- **No localStorage**: All data persisted to Supabase; `hooks/useLocalStorage.ts` is legacy (not used in new code)
- **Realtime**: AppContext subscribes to Supabase realtime channels for live updates across users
- **Routing**: Role-based view switching in `App.tsx` (no React Router); host vs member dashboards render different page components

### File & Directory Structure
```
lib/supabase.ts          → Supabase client singleton
services/                → Database CRUD operations (one file per table)
context/AppContext.tsx   → Global state + service orchestration
types.ts                 → App-level TypeScript interfaces
types/database.ts        → Generated Supabase database types
pages/auth/              → Login/signup UI
pages/host/              → Host dashboard & views
pages/member/            → Member dashboard & views
components/common/       → Reusable UI (Button, GlassCard, Modal, Notification)
```

## Key Patterns & Conventions

### Authentication & Authorization
- `Role` enum: `'host'` | `'member'` (controls which dashboard user sees)
- `UserStatus` enum: `'pending'` | `'approved'` (pending users cannot log in)
- First user must be manually promoted to host in Supabase dashboard
- Password changes use `supabase.auth.updateUser()`; no client-side hashing

### Data Operations
- **Always use service layer**: Never call `supabase.from()` directly in components; use `services/*` functions
- **Async/await**: All service calls and AppContext methods are async; components must await them
- **Error handling**: Services throw errors; AppContext catches and shows notifications via `showNotification(message, type)`
- **Optimistic UI**: AppContext reloads data after mutations (e.g., `await loadOrders()` after creating order)

### UI & Styling
- **Tailwind classes**: Inline utility classes (no CSS files)
- **UI primitives**: Use `Button`, `GlassCard`, `Modal`, `Notification` from `components/common/`
- **Icons**: Lucide React (`lucide-react` package)
- **Responsive**: Mobile-first design with `md:` breakpoints

### File Uploads
- **Storage bucket**: `sainath-uploads` (public bucket in Supabase Storage)
- **Upload flow**: Component → `AppContext.uploadFile(file: File)` → `fileService.uploadFile()` → Supabase Storage + DB record
- **File URLs**: Construct public URL: `${VITE_SUPABASE_URL}/storage/v1/object/public/sainath-uploads/${filePath}`

### Notifications
- Use `showNotification(message, type?)` from `useAppContext()` for all user feedback
- Auto-dismisses after 5 seconds
- Types: `'success'` | `'error'`

## Common Tasks

### Add a new database operation
1. Add method to appropriate service file (e.g., `services/eventService.ts`)
2. Add corresponding method in `context/AppContext.tsx`
3. Update `AppContextType` interface in `AppContext.tsx`
4. Call from component via `useAppContext()` hook

### Add a new view/page
1. Create component in `pages/host/views/` or `pages/member/views/`
2. Add view to switch statement in `HostDashboard.tsx` or `MemberDashboard.tsx`
3. Add navigation item to `Sidebar.tsx` if needed

### Add a new table/feature
1. Create table in Supabase SQL Editor
2. Update `types/database.ts` with new table schema
3. Add interface to `types.ts`
4. Create service file in `services/`
5. Add state + methods to `AppContext.tsx`
6. Build UI components

## Environment Variables

Required in `.env.local` and Vercel:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Access via `import.meta.env.VITE_SUPABASE_URL` (Vite env vars)

## Build & Deploy

- **Dev**: `npm run dev` (port 3000)
- **Build**: `npm run build` → outputs to `dist/`
- **Deploy**: Push to GitHub → Vercel auto-deploys (see `vercel.json` and `DEPLOYMENT.md`)

## Important Gotchas

- **TypeScript errors in services/**: Supabase generated types can show "never" errors; these are false positives and work at runtime
- **Loading state**: AppContext shows loading spinner until auth initializes; avoid race conditions by checking `loading` state
- **Stock verification**: Orders reduce stock only when verified; unverified orders don't affect inventory
- **Host-only actions**: Creating events, approving members, verifying orders/expenses restricted to host role
- **Realtime subscriptions**: Clean up subscriptions in useEffect return to avoid memory leaks

## Reference Examples

- **Service layer**: `services/orderService.ts` (CRUD pattern)
- **AppContext integration**: `context/AppContext.tsx` (state + realtime + error handling)
- **Component with service calls**: `pages/host/views/HostExpenseAndItems.tsx`
- **File upload**: `pages/host/views/HostPreviousData.tsx`
- **Authentication flow**: `pages/auth/Login.tsx` + `context/AppContext.tsx`

## Documentation

- Full deployment guide: `DEPLOYMENT.md`
- Quick start: `QUICKSTART.md`
- Database schema: See SQL in `DEPLOYMENT.md` or Supabase dashboard

## When Making Changes

- Preserve async/await patterns for all database operations
- Use existing service functions; don't duplicate database logic
- Keep AppContextType interface in sync with AppContext methods
- Test both host and member roles for new features
- Ensure realtime updates work (create/edit/delete should sync across sessions)
- Handle loading and error states in UI components

If unclear about Supabase patterns or realtime subscriptions, refer to `context/AppContext.tsx` for working examples.
