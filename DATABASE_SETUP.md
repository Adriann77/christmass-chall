# Christmas Challenge - Database Setup

## Database Configuration

This project uses different databases for development and production:

- **Development**: SQLite (local file `prisma/dev.db`)
- **Production**: PostgreSQL via Prisma Accelerate

## Schema Files

- `prisma/schema.prisma` - Development schema (SQLite) - default
- `prisma/schema.dev.prisma` - Development schema (SQLite) - explicit
- `prisma/schema.prod.prisma` - Production schema (PostgreSQL)

### Development (.env)

```env
DATABASE_URL="file:./dev.db"
```

### Production (set in your hosting platform)

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
DATABASE_URL_DIRECT="postgresql://..." # Optional: for migrations
```

## Development Workflow

### Initial Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma generate

# Run migrations for development (SQLite)
pnpm db:migrate:dev

# Seed the database
pnpm db:seed
```

### Daily Development

```bash
# Start dev server (uses SQLite)
pnpm dev

# Make schema changes
# Edit prisma/schema.dev.prisma

# Apply changes to dev database
pnpm db:push:dev
```

## Production Deployment

### First Time Setup

```bash
# Set environment variables on your hosting platform:
# DATABASE_URL=prisma+postgres://...
# NODE_ENV=production

# Push schema to production database (uses schema.prod.prisma)
pnpm db:push:prod

# Or use the interactive script
./scripts/deploy-schema.sh

# Or use migrations (requires DATABASE_URL_DIRECT)
pnpm db:migrate:deploy
```

### Build Process

```bash
# The build command will automatically:
# 1. Generate Prisma Client for PostgreSQL (schema.prod.prisma)
# 2. Build Next.js for production
pnpm build
```

## Available Scripts

- `pnpm dev` - Start development server (SQLite)
- `pnpm build` - Build for production (PostgreSQL via schema.prod.prisma)
- `pnpm start` - Start production server
- `pnpm db:migrate:dev` - Run migrations in development (uses schema.dev.prisma)
- `pnpm db:push:dev` - Push schema to dev database (uses schema.dev.prisma)
- `pnpm db:push:prod` - Push schema to production database (uses schema.prod.prisma)
- `pnpm db:migrate:deploy` - Deploy migrations to production (uses schema.prod.prisma)
- `pnpm db:seed` - Seed the database
- `./scripts/deploy-schema.sh` - Interactive production deployment

## Schema Files

- `prisma/schema.prisma` - Development schema (SQLite) - used by default
- `prisma/schema.dev.prisma` - Development schema (SQLite) - explicit backup
- `prisma/schema.prod.prisma` - Production schema (PostgreSQL) - used for builds

## Important Notes

1. **Never commit .env** - It contains sensitive API keys
2. **Development uses SQLite** - Fast local development
3. **Production uses PostgreSQL** - Scalable cloud database via Prisma Accelerate
4. **Migrations** - Use separate commands for dev and prod
5. **Build process** - Automatically generates Prisma Client for production

## Troubleshooting

### Build fails with database connection error

Make sure `DATABASE_URL` is set to the production PostgreSQL URL during build.

### Development database not found

Run `pnpm db:push:dev` to create the SQLite database.

### Production migrations fail

Ensure you have `DATABASE_URL_DIRECT` set for direct database access (not through Accelerate).
