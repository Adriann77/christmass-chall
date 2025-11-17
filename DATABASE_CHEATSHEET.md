# 🔄 Database Management - Quick Reference

## Current State (2025-11-17)

### Active Databases

- **Development**: SQLite (`prisma/dev.db`)
- **Production**: PostgreSQL via Prisma Accelerate

### Active Schema Fields

```prisma
model DailyTask {
  steps    Boolean  // 10 000 kroków
  training Boolean  // Trening/Rozciąganie
  diet     Boolean  // Zdrowa dieta
  book     Boolean  // Czytanie książki
  learning Boolean  // Nauka (1 godzina)
  water    Boolean  // 2.5 litra wody ⚠️ NEW (2025-11-17)
}
```

### Recent Changes

- ✅ **2025-11-17**: Added `water` field to DailyTask
- ✅ Migration: `20251117052934_add_water_to_daily_task`
- ✅ Deployed to production via `deploy-schema.sh`

## 🚨 Important Environment Variables

```bash
# Development (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Production (PostgreSQL)
DATABASE_URL_PROD="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
DATABASE_URL_DIRECT="postgres://user:pass@host:port/db?sslmode=require"
```

**⚠️ NEVER commit DATABASE_URL_PROD to git!**

## 📋 Common Tasks Checklist

### Adding a New Field to DailyTask

```bash
# 1. Edit schema.prisma (SQLite)
# Add field: fieldName Boolean @default(false)

# 2. Create dev migration
npx prisma migrate dev --name add_fieldname_to_daily_task

# 3. Edit schema.prod.prisma (PostgreSQL)
# Add the SAME field

# 4. Update TypeScript interfaces in code
# - app/dashboard/page.tsx (interface DailyTask)
# - Add to tasks array
# - app/api/tasks/[id]/route.ts (update logic)

# 5. Regenerate Prisma Client
npx prisma generate
rm -rf .next

# 6. Test locally
pnpm dev

# 7. Deploy to production
bash scripts/deploy-schema.sh

# 8. Verify in production
# Check app UI and database
```

### Checking Schema Status

```bash
# Development
npx prisma migrate status

# Production (requires env vars)
DATABASE_URL=$DATABASE_URL_PROD npx prisma migrate status --schema=prisma/schema.prod.prisma
```

### Opening Prisma Studio

```bash
# Development
npx prisma studio

# Production (view only - be careful!)
DATABASE_URL=$DATABASE_URL_PROD npx prisma studio --schema=prisma/schema.prod.prisma
```

### Reset Development Database

```bash
# ⚠️ This DELETES all dev data!
npx prisma migrate reset --force

# If migrations are broken:
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

## 🐛 Troubleshooting Quick Fixes

### Error: P6001 (Connection)

```bash
# Check DATABASE_URL path
cat .env | grep DATABASE_URL
# Should be: file:./prisma/dev.db
# NOT: file:./dev.db

# Fix:
echo 'DATABASE_URL="file:./prisma/dev.db"' >> .env
npx prisma generate
```

### Error: Drift Detected

```bash
# Schema and DB are out of sync
npx prisma migrate reset --force
# OR
npx prisma db push
```

### Error: TypeScript Not Finding New Field

```bash
# Regenerate everything
npx prisma generate
rm -rf .next node_modules/.cache
pnpm dev
```

### Error: Production Deploy Failed

```bash
# Check environment variables are set
echo $DATABASE_URL_PROD
echo $DATABASE_URL_DIRECT

# Try manual push
DATABASE_URL=$DATABASE_URL_PROD npx prisma db push --schema=prisma/schema.prod.prisma
```

## 📊 Current Database Stats

### Tables

- `User` (3 users)
- `DailyTask` (varies per day)
- `Spending` (per user activity)

### Users in Dev DB

```
adrian  | Adrian
justyna | Justyna
adr1    | adr
```

### Indexes

- `User.username` (unique)
- `DailyTask.userId_date` (composite unique)
- `Spending.userId`
- `Spending.dailyTaskId`

## 🔐 Security Checklist

- [ ] `.env` is in `.gitignore`
- [ ] Production URLs are not in code
- [ ] Passwords are hashed (bcrypt)
- [ ] Session cookies are HttpOnly
- [ ] API routes check authentication
- [ ] SQL injection protected (via Prisma)

## 🚀 Deployment Checklist

Before deploying schema changes to production:

- [ ] Tested locally with dev.db
- [ ] Both schemas updated (schema.prisma + schema.prod.prisma)
- [ ] Migration created and applied to dev
- [ ] Code updated to use new fields
- [ ] TypeScript compiles without errors
- [ ] UI tested in browser
- [ ] API routes tested (Postman/Thunder Client)
- [ ] Backup plan if rollback needed
- [ ] Monitoring set up (logs, errors)

## 📞 Emergency Contacts

If production database is broken:

1. **Check Prisma Status Dashboard**: https://www.prisma-status.com/
2. **Review recent migrations**: `prisma/migrations/`
3. **Check application logs**: Vercel/Railway dashboard
4. **Rollback code**: `git revert HEAD && git push`
5. **Contact team**: Slack #urgent

## 🔄 Backup & Restore

### Backup Production Database

```bash
# PostgreSQL dump (if you have direct access)
pg_dump $DATABASE_URL_DIRECT > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Only if you have backup and direct access
psql $DATABASE_URL_DIRECT < backup_20251117.sql
```

**Note**: With Prisma Accelerate, direct access may be limited. Always test in dev first!

## 📈 Performance Tips

- Add indexes for frequently queried fields
- Use `select` to limit returned fields
- Use `include` wisely (avoid N+1 queries)
- Consider pagination for large datasets
- Monitor query performance in Prisma Studio

## 🔗 Quick Links

- [Prisma Docs - Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Accelerate Dashboard](https://console.prisma.io/)
- [Project Architecture](./ARCHITECTURE.md)
- [Migration Guide](./PRISMA_MIGRATION_GUIDE.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)

---

**Keep this doc updated!** Add notes when you make significant changes.

_Last updated: 2025-11-17 after adding `water` field_
