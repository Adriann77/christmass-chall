# 🤖 AI Assistant FAQ - Christmas Challenge

> Quick answers for AI models helping with this codebase

## Project Overview

**What is this?** A Next.js habit tracking app for Christmas challenges with 6 daily tasks, expense tracking, calendar view, and 7-day diet plan.

**Tech Stack**: Next.js 15, TypeScript, Prisma 6, SQLite (dev), PostgreSQL (prod), Tailwind CSS, shadcn/ui, Framer Motion

**Database**: Dual setup - SQLite for development, PostgreSQL via Prisma Accelerate for production

## Common Questions

### Q: How do I add a new field to DailyTask?

**A**: Follow this exact sequence:

1. Edit `prisma/schema.prisma` - add field
2. Run `npx prisma migrate dev --name descriptive_name`
3. Edit `prisma/schema.prod.prisma` - add SAME field
4. Update TypeScript interfaces in affected files
5. Run `npx prisma generate && rm -rf .next`
6. Test locally
7. Run `bash scripts/deploy-schema.sh` to deploy to prod

**Full details**: See `PRISMA_MIGRATION_GUIDE.md`

### Q: Where is the database file?

**A**:

- **Development**: `prisma/dev.db` (SQLite)
- **Production**: PostgreSQL via Prisma Accelerate (connection string in `.env`)

**Important**: DATABASE_URL must be `file:./prisma/dev.db` not `file:./dev.db`

### Q: How does authentication work?

**A**: Session-based with HTTP-only cookies

- Login: `POST /api/auth/login` → creates session cookie
- Logout: `POST /api/auth/logout` → clears cookie
- Current user: `GET /api/auth/me`
- All API routes check cookie validity
- Passwords hashed with bcrypt (10 rounds)

**Code**: `lib/auth.ts`

### Q: What are the 6 daily tasks?

**A**:

1. `steps` - 10,000 steps (10 000 kroków)
2. `training` - Training/stretching (Trening/Rozciąganie)
3. `diet` - Healthy diet (Zdrowa dieta)
4. `book` - Read a book (Czytanie książki)
5. `learning` - Study 1 hour (Nauka - 1 godzina)
6. `water` - 2.5 liters of water (2.5 litra wody) ⭐ **Added 2025-11-17**

**Code**: `app/dashboard/page.tsx` (tasks array)

### Q: How do I run the app locally?

**A**:

```bash
pnpm install
npx prisma generate
npx prisma migrate dev  # or: npx prisma db push
pnpm dev
```

Open http://localhost:3000

### Q: How to reset the development database?

**A**:

```bash
npx prisma migrate reset --force
```

This deletes `dev.db`, recreates it, and applies all migrations.

### Q: Why two schema files?

**A**: SQLite (dev) and PostgreSQL (prod) have different syntax and features.

- `schema.prisma` → SQLite, used for local development
- `schema.prod.prisma` → PostgreSQL, used for production deploy

**They must be kept in sync manually!**

### Q: What's the difference between migrate dev and db push?

**A**:

- `prisma migrate dev` - Creates migration file, applies it, generates client. **Use for dev.**
- `prisma db push` - Directly syncs schema to DB without migration file. **Use for prod** (via script).

### Q: How do I deploy schema changes to production?

**A**:

```bash
bash scripts/deploy-schema.sh
```

This uses `schema.prod.prisma` and pushes to PostgreSQL.

**Full guide**: `PRISMA_MIGRATION_GUIDE.md`

### Q: Where is the diet data?

**A**: Static JSON file at `app/data/diet.json`

- 7 days × 3 meals × ingredients with macros
- Not in database, loaded client-side
- Displayed in `/dashboard/diet` and `/dashboard/diet/[day]`

### Q: What if TypeScript shows errors after schema change?

**A**:

```bash
npx prisma generate  # Regenerate Prisma Client types
rm -rf .next node_modules/.cache  # Clear Next.js cache
pnpm dev  # Restart dev server
```

### Q: How to fix "P6001 Connection Error"?

**A**: Check `DATABASE_URL` in `.env`:

```bash
# ✅ Correct
DATABASE_URL="file:./prisma/dev.db"

# ❌ Wrong
DATABASE_URL="file:./dev.db"
```

Then:

```bash
npx prisma generate
pnpm dev
```

### Q: How to add a new page?

**A**: Next.js App Router pattern:

1. Create `app/new-route/page.tsx`
2. Add navigation link in bottom nav (all dashboard pages)
3. Import icon from lucide-react
4. Follow existing pattern (see `app/dashboard/diet/page.tsx`)

### Q: Where are UI components?

**A**: `components/ui/*` - shadcn/ui components

- Already installed: button, card, checkbox, dialog, input, label, calendar, accordion
- To add more: `npx shadcn@latest add component-name`

### Q: How does the daily task API work?

**A**:

1. `GET /api/tasks/today` - Gets or creates DailyTask for current date (00:00:00)
2. `PATCH /api/tasks/[id]` - Updates task fields (steps, training, etc.)
3. Date is normalized to midnight for consistent querying
4. Automatically creates task if doesn't exist for today

**Code**: `app/api/tasks/today/route.ts` and `app/api/tasks/[id]/route.ts`

### Q: What's in the navigation?

**A**: Fixed bottom navigation with 4 links:

1. Zadania (Tasks) - `/dashboard`
2. Wydatki (Spending) - `/dashboard/spending`
3. Dieta (Diet) - `/dashboard/diet`
4. Kalendarz (Calendar) - `/dashboard/calendar`

All use Lucide React icons.

### Q: How are passwords stored?

**A**: Hashed with bcrypt

```typescript
// On registration/password change
const hashedPassword = await bcrypt.hash(password, 10);

// On login
const isValid = await bcrypt.compare(password, user.password);
```

**Never** store plain text passwords!

### Q: What's the relationship between models?

**A**:

```
User 1:N DailyTask (user can have many daily tasks)
User 1:N Spending (user can have many spendings)
DailyTask 1:N Spending (each spending belongs to a day)
```

Cascade delete: Delete user → deletes all their tasks and spendings.

### Q: How to check migration status?

**A**:

```bash
# Development
npx prisma migrate status

# Production (needs env var)
DATABASE_URL=$DATABASE_URL_PROD npx prisma migrate status --schema=prisma/schema.prod.prisma
```

### Q: Can I use Prisma Studio?

**A**: Yes!

```bash
# Development
npx prisma studio

# Production (view only)
DATABASE_URL=$DATABASE_URL_PROD npx prisma studio --schema=prisma/schema.prod.prisma
```

Opens GUI at http://localhost:5555

### Q: What's the folder structure?

**A**:

```
app/
├── api/          → Backend API routes
├── dashboard/    → Frontend pages
├── data/         → Static data (diet.json)
components/ui/    → shadcn/ui components
lib/              → Utilities (auth, prisma, utils)
prisma/           → Database schemas & migrations
scripts/          → Deployment scripts
```

### Q: Where's the styling?

**A**:

- **Global**: `app/globals.css`
- **Tailwind**: Inline classes on components
- **Colors**: Custom CSS variables in globals.css
- **Components**: shadcn/ui with Tailwind

### Q: How to add animations?

**A**: Use Framer Motion:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>;
```

See examples in `app/dashboard/page.tsx`

### Q: What environment variables are needed?

**A**:

```env
# Required for dev
DATABASE_URL="file:./prisma/dev.db"

# Required for prod deploy
DATABASE_URL_PROD="prisma+postgres://..."
DATABASE_URL_DIRECT="postgres://..."

# Optional (for auth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random-secret"
```

### Q: How to debug?

**A**:

1. **Console logs**: Add `console.log()` in API routes
2. **Network tab**: Check requests/responses in browser DevTools
3. **Prisma Studio**: View database contents
4. **TypeScript errors**: Check terminal and VS Code Problems panel
5. **Database logs**: Prisma logs queries with `log: ['query']` in client

## Quick Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
npx prisma studio     # Open database GUI

# Database
npx prisma generate                    # Regenerate Prisma Client
npx prisma migrate dev --name NAME     # Create & apply migration
npx prisma migrate reset --force       # Reset dev DB
npx prisma db push                     # Sync schema without migration

# Production
bash scripts/deploy-schema.sh         # Deploy to prod PostgreSQL

# Cleanup
rm -rf .next node_modules/.cache      # Clear Next.js cache
```

## File Locations Quick Reference

| What                 | Where                               |
| -------------------- | ----------------------------------- |
| Dashboard with tasks | `app/dashboard/page.tsx`            |
| Diet plan overview   | `app/dashboard/diet/page.tsx`       |
| Diet day details     | `app/dashboard/diet/[day]/page.tsx` |
| Auth logic           | `lib/auth.ts`                       |
| Prisma client        | `lib/prisma.ts`                     |
| Tasks API (today)    | `app/api/tasks/today/route.ts`      |
| Tasks API (update)   | `app/api/tasks/[id]/route.ts`       |
| Login API            | `app/api/auth/login/route.ts`       |
| Dev schema           | `prisma/schema.prisma`              |
| Prod schema          | `prisma/schema.prod.prisma`         |
| Diet data            | `app/data/diet.json`                |
| UI components        | `components/ui/*`                   |

## Documentation Files

| Document                    | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `ARCHITECTURE.md`           | Full app architecture, tech stack, models |
| `PRISMA_MIGRATION_GUIDE.md` | Step-by-step migration to production      |
| `DEVELOPER_GUIDE.md`        | Onboarding for new developers             |
| `DATABASE_CHEATSHEET.md`    | Quick DB commands and troubleshooting     |
| `CHANGELOG.md`              | Version history and changes               |
| `README.md`                 | Project overview and getting started      |

## Last Updated

2025-11-17 - After adding water field and comprehensive documentation

---

**For AI Assistants**: When helping with this codebase:

1. Always check if both schema files need updating
2. Remember to regenerate Prisma Client after schema changes
3. Clear `.next` cache when types aren't updating
4. Reference these docs for accurate guidance
5. Test changes locally before suggesting production deployment
