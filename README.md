# 🎄 Christmas Challenge App

A beautiful, mobile-first web application for tracking daily challenges throughout December until Christmas (December 24th). Built with Next.js 16, Prisma, and styled with Tailwind CSS and shadcn/ui components.

**App is fully translated to Polish (Polski)** 🇵🇱

## ✨ Features

- 🔐 **Authentication System** - Secure login with two demo accounts
- ✅ **Daily Task Tracking** - Track 5 daily tasks:
  - 10,000 steps (10 000 kroków)
  - Training/stretching (Trening/Rozciąganie)
  - Clean diet (Zdrowa dieta)
  - Reading a book (Czytanie książki)
  - Learning for one hour (Nauka - 1 godzina)
- 💰 **Spending Tracker** - Log daily expenses with categories (Wydatki)
- 📅 **Calendar Progress View** - Visual overview of completed vs incomplete days (Kalendarz)
- 🎨 **Christmas-themed UI** - Festive red, green, and gold color scheme
- 📱 **Mobile-First Design** - Optimized for mobile devices with fixed bottom navigation
- ✨ **Smooth Animations** - Powered by Framer Motion
- 🌐 **Polish Language** - All UI text in Polish

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd christmas-chall
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up the database:

```bash
pnpm db:seed
```

This will create:

- SQLite database file
- Two demo users (adrian/adrian and justyna/justyna)
- Daily task records for December 1-24, 2025

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 👤 Demo Accounts

- **Username:** adrian | **Password:** adrian
- **Username:** justyna | **Password:** justyna

## 🗂️ Project Structure

```
├── app/
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── tasks/           # Task management endpoints
│   │   ├── spendings/       # Spending tracker endpoints
│   │   └── calendar/        # Calendar data endpoint
│   ├── dashboard/           # Main app pages
│   │   ├── page.tsx         # Daily tasks view
│   │   ├── spending/        # Spending tracker page
│   │   └── calendar/        # Calendar progress page
│   ├── login/               # Login page
│   └── ...
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth.ts             # Authentication utilities
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding script
└── ...
```

## 🎯 Daily Tasks

Each day from December 1-24, users can track completion of these tasks:

1. **10 000 kroków** - Hit your daily step goal
2. **Trening/Rozciąganie** - Complete a workout or stretching routine
3. **Zdrowa dieta** - Maintain healthy eating (no chocolate, sweets, etc.)
4. **Czytanie książki** - Dedicate time to reading
5. **Nauka (1 godzina)** - Spend an hour learning something new

## 💾 Database

The app uses different databases for development and production:

### Development

- **SQLite** - Local file database (`prisma/dev.db`)
- Fast and easy for local development
- No additional setup required

### Production

- **PostgreSQL** - Via Prisma Accelerate
- Scalable cloud database with caching
- High performance and reliability

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed configuration instructions.

### Quick Setup

**Development:**

```bash
pnpm db:push:dev    # Push schema to SQLite
pnpm db:seed        # Seed with demo data
pnpm dev            # Start development server
```

**Production:**

```bash
./scripts/deploy-schema.sh  # Deploy schema to PostgreSQL
pnpm build                   # Build for production
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

## 🎨 Customization

### Colors

Christmas-themed colors are defined in `app/globals.css`:

- Primary: Christmas Red
- Secondary: Christmas Green
- Accent: Gold

### Tasks

To modify the daily tasks, edit the task array in `app/dashboard/page.tsx`

### Spending Categories

Categories can be customized in `app/dashboard/spending/page.tsx` by modifying the `CATEGORIES` array. Current Polish categories:

- Jedzenie i picie (Food & Dining)
- Zakupy (Shopping)
- Transport (Transportation)
- Rozrywka (Entertainment)
- Zdrowie i fitness (Health & Fitness)
- Rachunki (Bills & Utilities)
- Inne (Other)

## 📱 Mobile Design

The app features:

- Minimal header with only logout button
- Scrollable content area
- Fixed bottom navigation bar for easy access to:
  - Zadania (Tasks)
  - Wydatki (Spending tracker)
  - Kalendarz (Calendar view)

## 🔧 Scripts

### Development

- `pnpm dev` - Start development server (uses SQLite)
- `pnpm db:push:dev` - Push schema to development database
- `pnpm db:migrate:dev` - Create and apply migrations for dev
- `pnpm db:seed` - Seed the database with initial data

### Production

- `pnpm build` - Build for production (uses PostgreSQL)
- `pnpm start` - Start production server
- `pnpm db:push:prod` - Push schema to production database
- `pnpm db:migrate:deploy` - Deploy migrations to production
- `./scripts/deploy-schema.sh` - Interactive production deployment

### General

- `pnpm lint` - Run ESLint
- `pnpm prisma generate` - Generate Prisma Client
- `pnpm prisma studio` - Open Prisma Studio GUI

## 📦 Tech Stack

- **Framework:** Next.js 16
- **Database:** Prisma + SQLite (easily switchable to PostgreSQL, MySQL, etc.)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Authentication:** Custom cookie-based session management
- **Language:** TypeScript

## 🎉 Features by Page

### Login (`/login`)

- Beautiful Christmas-themed login form (Wyzwanie Świąteczne)
- Animated Christmas tree emoji
- Demo account credentials displayed in Polish

### Dashboard (`/dashboard`)

- Day counter (Dzień X z 24)
- Progress bar showing task completion (Dzisiejszy postęp)
- Interactive task checklist (Dzisiejsze zadania)
- Instant task toggling with optimistic updates
- Minimal header with logout button only

### Spending Tracker (`/dashboard/spending`)

- Add expenses with amount, category, and description (Dodaj wydatek)
- View all expenses for the current day (Dzisiejsze wydatki)
- Total spending calculation (Łącznie wydane dzisiaj)
- Categorized expense tracking in Polish

### Calendar View (`/dashboard/calendar`)

- Visual 24-day calendar grid (Grudzień 2025)
- Color-coded days (Podsumowanie):
  - 🌟 Perfekcyjne: All 5 tasks completed
  - ✅ Dobre: 3-4 tasks completed
  - ⚠️ Częściowe: 1-2 tasks completed
  - ❌ Nieukończone: No tasks completed
- Statistics overview (Podsumowanie)
- Legend for day status (Legenda)

## 🚀 Deployment

The app can be deployed to any platform that supports Next.js. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy to Vercel

1. **Set environment variables** in Vercel dashboard:

```env
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-string
NODE_ENV=production
```

2. **Deploy schema to production database:**

```bash
./scripts/deploy-schema.sh
```

3. **Deploy to Vercel:**

```bash
vercel --prod
```

### Supported Platforms

- **Vercel** ⭐ (recommended - seamless Next.js integration)
- **Railway** (great for full-stack apps)
- **Fly.io** (global edge deployment)
- **Netlify** (alternative to Vercel)
- **Docker** (self-hosted option)

### Important Notes

- Production uses PostgreSQL via Prisma Accelerate
- Development uses SQLite for local testing
- Database schema is automatically deployed during build
- All environment variables must be set in your hosting platform
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for database configuration
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment checklist

## 📝 License

This project is open source and available for personal use.

## 🎅 Happy Holidays!

Enjoy tracking your Christmas challenges and stay disciplined throughout December! 🎄✨
