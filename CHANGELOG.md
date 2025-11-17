# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-11-17

### Added

- **Water Tracking**: New daily task for tracking 2.5 liters of water intake
  - Added `water` boolean field to `DailyTask` model
  - New Droplet icon in dashboard
  - Migration: `20251117052934_add_water_to_daily_task`
- **Diet Plan Feature**: Complete 7-day diet planning module
  - `/dashboard/diet` route with 7 days overview
  - `/dashboard/diet/[day]` route with meal details
  - Accordion component for meal breakdown
  - Full macros display (calories, protein, fat, carbs)
  - Ingredient lists with nutritional values
  - Static diet data in `app/data/diet.json`
- **Navigation**: Added "Dieta" link to bottom navigation across all pages
- **Documentation**: Comprehensive developer documentation
  - `ARCHITECTURE.md` - Full application architecture
  - `PRISMA_MIGRATION_GUIDE.md` - Database migration procedures
  - `DEVELOPER_GUIDE.md` - Onboarding guide for new developers
  - `DATABASE_CHEATSHEET.md` - Quick reference for database tasks

### Changed

- Updated dashboard to display 6 tasks instead of 5
- Updated bottom navigation on all dashboard pages to include diet link

### Fixed

- Database connection error (P6001): Corrected DATABASE_URL path from `file:./dev.db` to `file:./prisma/dev.db`
- Prisma Client regeneration issues after schema changes

### Technical

- Deployed water field to production PostgreSQL database via Prisma Accelerate
- Added accordion component from shadcn/ui
- Updated TypeScript interfaces across API routes and components
- Cleared Next.js cache for proper type generation

## [1.1.0] - 2025-11-16

### Added

- Initial Christmas Challenge application
- Authentication system with session-based cookies
- 5 daily tasks tracking (steps, training, diet, book, learning)
- Spending tracker with categories
- Calendar view with monthly overview
- Dual database setup (SQLite dev, PostgreSQL prod)
- Prisma ORM with migrations
- shadcn/ui component library
- Framer Motion animations
- Mobile-first responsive design

### Database

- `User` model with bcrypt password hashing
- `DailyTask` model with unique constraint on userId + date
- `Spending` model with relations to User and DailyTask
- Initial migration: `20251115141049_init`

### Pages

- `/login` - Authentication page
- `/register` - User registration
- `/dashboard` - Main dashboard with daily tasks
- `/dashboard/spending` - Expense tracking
- `/dashboard/calendar` - Progress calendar

## Database Migrations

### 2025-11-17

- `20251117052934_add_water_to_daily_task` - Added water field to DailyTask

### 2025-11-15

- `20251115141049_init` - Initial database schema with User, DailyTask, Spending models

## Notes

### Breaking Changes

None in current version. All schema changes are backward compatible (new fields have defaults).

### Deprecations

None.

### Security Updates

- All passwords stored as bcrypt hashes (10 rounds)
- HttpOnly cookies for sessions
- SameSite=Strict cookie policy
- Input validation on all API endpoints

---

**Legend**:

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements
- `Technical` - Infrastructure/build changes
