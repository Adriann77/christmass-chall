# Production Deployment Checklist

## Pre-Deployment

### 1. Database Setup

- [ ] Prisma Accelerate project created
- [ ] API key obtained from Prisma dashboard
- [ ] `DATABASE_URL_PROD` added to `.env` file locally
- [ ] Test connection to production database

### 2. Environment Variables

Set these in your hosting platform (Vercel, Railway, etc.):

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-secure-random-secret"
NODE_ENV="production"
```

### 3. Deploy Database Schema

```bash
# Run this locally to push schema to production database
./scripts/deploy-schema.sh

# Or manually:
DATABASE_URL=$DATABASE_URL_PROD pnpm prisma db push
```

### 4. Build and Test Locally

```bash
# Test production build locally
NODE_ENV=production pnpm build
pnpm start
```

## Deployment Steps

### Option A: Vercel (Recommended)

1. **Connect Repository**

   ```bash
   vercel
   ```

2. **Configure Environment Variables** in Vercel Dashboard:

   - `DATABASE_URL` → Your Prisma Accelerate URL
   - `NEXTAUTH_URL` → Your production domain
   - `NEXTAUTH_SECRET` → Secure random string
   - `NODE_ENV` → `production`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Option B: Railway

1. **Create New Project** in Railway dashboard

2. **Add Environment Variables**:

   - Same as above

3. **Connect Repository** and deploy

### Option C: Docker

```bash
# Build image
docker build -t christmas-chall .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-url" \
  -e NEXTAUTH_URL="your-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NODE_ENV="production" \
  christmas-chall
```

## Post-Deployment

### 1. Verify Database

- [ ] Check tables exist in production database
- [ ] Test user registration
- [ ] Test task creation
- [ ] Test spending creation

### 2. Test Application

- [ ] Login works
- [ ] Tasks can be created and updated
- [ ] Spendings can be added
- [ ] Calendar displays correctly
- [ ] Month navigation works

### 3. Monitor

- [ ] Check application logs
- [ ] Monitor database performance
- [ ] Set up error tracking (Sentry, etc.)

## Rollback Plan

If issues occur:

1. **Revert Database Changes**

   ```bash
   # If you have migrations
   DATABASE_URL=$DATABASE_URL_PROD pnpm prisma migrate resolve --rolled-back <migration-name>
   ```

2. **Redeploy Previous Version**
   ```bash
   vercel rollback
   # or use your platform's rollback feature
   ```

## Common Issues

### Build fails with Prisma error

**Solution**: Ensure `prisma generate` runs during build

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Database connection timeout

**Solution**:

- Check API key is correct
- Verify Prisma Accelerate project is active
- Check firewall/network settings

### Environment variables not loading

**Solution**:

- Verify variables are set in hosting platform
- Restart the application
- Check variable names match exactly

## Development vs Production

| Aspect      | Development                | Production                     |
| ----------- | -------------------------- | ------------------------------ |
| Database    | SQLite (`file:./dev.db`)   | PostgreSQL (Prisma Accelerate) |
| Schema File | `prisma/schema.dev.prisma` | `prisma/schema.prisma`         |
| Command     | `pnpm dev`                 | `pnpm build && pnpm start`     |
| Migrations  | `pnpm db:migrate:dev`      | `pnpm db:migrate:deploy`       |
| Push Schema | `pnpm db:push:dev`         | `pnpm db:push:prod`            |

## Security Checklist

- [ ] All `.env*` files in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] NEXTAUTH_SECRET is strong random string
- [ ] CORS settings configured correctly
- [ ] API rate limiting implemented
- [ ] Database credentials secure
- [ ] HTTPS enabled on production domain

## Monitoring

Recommended tools:

- **Vercel Analytics** - Built-in monitoring
- **Prisma Pulse** - Database change monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay

## Support

If you encounter issues:

1. Check the logs in your hosting platform
2. Review Prisma Accelerate dashboard
3. Check DATABASE_SETUP.md for detailed configuration
