# 🎄 Christmas Challenge App

A Next.js habit tracking application for managing daily tasks, expenses, and diet planning during the Christmas challenge period.

## 🚀 Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **Database**: Prisma ORM (SQLite dev, PostgreSQL prod)
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Authentication**: Session-based with HTTP-only cookies

## 📦 Features

- ✅ Custom task templates with daily completion tracking
- 💰 Expense tracking with categories
- 📅 Calendar view with historical data
- 🥗 7-day diet plan viewer
- 🔐 Secure authentication
- 🎨 Responsive UI with smooth animations
- ⚡ Optimistic updates for instant feedback

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm db:migrate

# Seed database (optional - creates test users)
pnpm db:seed

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Test Users (after seeding)

- Username: `adrian` / Password: `adrian`
- Username: `justyna` / Password: `justyna`

## 📝 Available Scripts

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database commands
pnpm db:push          # Push schema changes to database
pnpm db:migrate       # Create and run migrations
pnpm db:seed          # Seed database with test data
pnpm prisma:studio    # Open Prisma Studio
pnpm prisma:generate  # Generate Prisma client
```

## 🗄️ Database Setup

### Development (SQLite)

Set in your `.env`:
```env
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL)

Set in your `.env`:
```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

## 🏗️ Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Auth pages
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── BottomNav.tsx     # Navigation component
│   └── Providers.tsx     # Query provider wrapper
├── lib/
│   ├── hooks/            # TanStack Query hooks
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Helper functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Migration files
│   └── seed.ts           # Database seeding
```

## 🔑 Key Features Explained

### Task Templates
Users can create custom task templates (e.g., "10,000 steps", "Read a book") that automatically generate daily completion trackers.

### State Management
TanStack Query provides:
- Automatic caching and background refetching
- Optimistic updates for instant UI feedback
- Loading and error states
- Efficient data synchronization

### Bottom Navigation
Centralized navigation component in root layout - appears on all dashboard routes automatically.

## 📄 License

Private project
