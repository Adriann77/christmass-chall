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

The app uses SQLite for local development (stored in `prisma/dev.db`). The schema includes:

- **User** - User accounts and authentication
- **DailyTask** - Daily task completion tracking
- **Spending** - Expense records with categories

To migrate to an online database later, simply:
1. Update the `DATABASE_URL` in `.env`
2. Change the provider in `prisma/schema.prisma`
3. Run `npx prisma migrate deploy`

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

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:seed` - Seed the database with initial data
- `pnpm lint` - Run ESLint

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

The app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Fly.io**

Remember to:
1. Set environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`)
2. Run database migrations
3. Update the database to a production-ready solution

## 📝 License

This project is open source and available for personal use.

## 🎅 Happy Holidays!

Enjoy tracking your Christmas challenges and stay disciplined throughout December! 🎄✨
