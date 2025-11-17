# Christmas Challenge - Architektura Aplikacji

## 📋 Przegląd

Christmas Challenge to aplikacja Next.js 15 do śledzenia codziennych nawyków i wyzwań w okresie poprzedzającym Święta Bożego Narodzenia. Użytkownicy mogą śledzić 6 różnych zadań dziennie, zarządzać wydatkami i przeglądać swój 7-dniowy plan diety.

## 🏗️ Stack Technologiczny

- **Framework**: Next.js 15 (App Router + Turbopack)
- **Język**: TypeScript
- **Baza danych**:
  - Development: SQLite (plik lokalny)
  - Production: PostgreSQL via Prisma Accelerate
- **ORM**: Prisma 6.19.0
- **UI**: shadcn/ui + Tailwind CSS
- **Animacje**: Framer Motion
- **Ikony**: Lucide React
- **Package Manager**: pnpm

## 📁 Struktura Projektu

```
christmas-chall/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── auth/                 # Autentykacja
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── register/
│   │   │   └── me/
│   │   ├── tasks/                # Zadania dzienne
│   │   │   ├── today/
│   │   │   └── [id]/
│   │   ├── calendar/             # Historia zadań
│   │   └── spendings/            # Wydatki
│   ├── dashboard/                # Strony dashboardu
│   │   ├── page.tsx              # Lista zadań dziennych
│   │   ├── spending/             # Zarządzanie wydatkami
│   │   ├── calendar/             # Widok kalendarza
│   │   └── diet/                 # Plan diety
│   │       ├── page.tsx          # Lista 7 dni
│   │       └── [day]/page.tsx    # Szczegóły dnia
│   ├── login/
│   ├── register/
│   └── data/                     # Statyczne dane
│       └── diet.json             # 7-dniowy plan diety
├── components/
│   └── ui/                       # Komponenty shadcn/ui
├── lib/
│   ├── auth.ts                   # Logika autentykacji
│   ├── prisma.ts                 # Prisma Client singleton
│   ├── env.ts                    # Konfiguracja środowiska
│   └── utils.ts                  # Narzędzia
├── prisma/
│   ├── schema.prisma             # Schema dev (SQLite)
│   ├── schema.prod.prisma        # Schema prod (PostgreSQL)
│   ├── schema.dev.prisma         # Backup dev schema
│   ├── migrations/               # Migracje bazy danych
│   ├── dev.db                    # Baza SQLite (development)
│   └── seed.ts                   # Seed data
├── scripts/
│   ├── deploy-schema.sh          # Deploy schema na prod
│   └── switch-db.sh              # Przełączanie między dev/prod
└── public/                       # Pliki statyczne
```

## 🗄️ Modele Bazy Danych

### User

Użytkownik aplikacji

- `id`: UUID
- `username`: String (unique)
- `password`: String (hashed)
- `name`: String
- `createdAt`, `updatedAt`: DateTime

### DailyTask

Dzienne zadanie użytkownika

- `id`: UUID
- `userId`: Foreign Key → User
- `date`: DateTime (unique per user)
- `steps`: Boolean (10 000 kroków)
- `training`: Boolean (Trening/Rozciąganie)
- `diet`: Boolean (Zdrowa dieta)
- `book`: Boolean (Czytanie książki)
- `learning`: Boolean (Nauka - 1 godzina)
- `water`: Boolean (2.5 litra wody)
- `createdAt`, `updatedAt`: DateTime

### Spending

Wydatek przypisany do dnia

- `id`: UUID
- `userId`: Foreign Key → User
- `dailyTaskId`: Foreign Key → DailyTask
- `amount`: Float
- `category`: String
- `description`: String (optional)
- `createdAt`: DateTime

## 🔐 Autentykacja

- **Typ**: Session-based (cookie)
- **Hashowanie**: bcrypt (10 rounds)
- **Cookie**: HttpOnly, Secure (prod), SameSite=Strict
- **Długość sesji**: 7 dni
- **Middleware**: Sprawdzanie sesji w API routes

## 🎯 Główne Funkcje

### 1. Dashboard Zadań Dziennych

- 6 zadań do wykonania dziennie
- Checkbox dla każdego zadania
- Progress bar pokazujący postęp
- Licznik dni do Świąt
- Automatyczne tworzenie DailyTask dla nowego dnia

### 2. Zarządzanie Wydatkami

- Dodawanie wydatków z kategorią i kwotą
- Lista wszystkich wydatków
- Suma wydatków
- Przypisanie wydatku do konkretnego dnia

### 3. Kalendarz

- Widok miesięczny
- Kliknięcie na dzień pokazuje szczegóły zadań
- Status zadań (ukończone/nieukończone)
- Lista wydatków dla wybranego dnia

### 4. Plan Diety

- 7-dniowy plan żywieniowy
- 3 posiłki dziennie
- Accordion dla każdego posiłku
- Szczegóły: składniki, kalorie, makroskładniki (białko/tłuszcz/węgle)
- Podsumowanie dzienne

## 🔄 Przepływ Danych

### Pobieranie dziennych zadań

```
Client → GET /api/tasks/today
         ↓
     Sprawdź sesję
         ↓
     Znajdź lub utwórz DailyTask dla dzisiejszego dnia
         ↓
     Zwróć dane z includowanymi wydatkami
         ↓
     Client aktualizuje UI
```

### Aktualizacja zadania

```
Client → PATCH /api/tasks/[id]
         ↓
     Sprawdź sesję i uprawnienia
         ↓
     Aktualizuj pola (steps, training, diet, book, learning, water)
         ↓
     Zwróć zaktualizowane dane
         ↓
     Client aktualizuje UI
```

## 🌐 Środowiska

### Development

- **Baza**: SQLite (`prisma/dev.db`)
- **URL**: `file:./prisma/dev.db`
- **Schema**: `prisma/schema.prisma`
- **Port**: 3000

### Production

- **Baza**: PostgreSQL via Prisma Accelerate
- **URL**: `DATABASE_URL_PROD` (z .env)
- **Direct URL**: `DATABASE_URL_DIRECT` (dla migracji)
- **Schema**: `prisma/schema.prod.prisma`

## 🚀 Uruchamianie

### Development

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

## 📝 Zmienne Środowiskowe

```env
# Development Database (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Production Database (PostgreSQL via Prisma Accelerate)
DATABASE_URL_PROD="prisma+postgres://accelerate.prisma-data.net/?api_key=..."

# Direct URL for migrations (PostgreSQL)
DATABASE_URL_DIRECT="postgres://user:pass@host:port/db?sslmode=require"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## 🎨 Design System

### Kolory

- Primary: Niebieski (checkboxy, aktywne elementy)
- Secondary: Szary (tła kart)
- Accent: Gradient (progress bary)

### Makroskładniki (Dieta)

- **Białko**: Niebieski (#2563eb)
- **Tłuszcz**: Żółty (#ca8a04)
- **Węglowodany**: Zielony (#16a34a)
- **Kalorie**: Pomarańczowy (ikona flame)

### Ikony Zadań

- 🏃 Steps: TrendingUp
- 💪 Training: Dumbbell
- 🍎 Diet: Apple
- 📚 Book: Book
- 🎓 Learning: GraduationCap
- 💧 Water: Droplet

## 📱 Responsywność

- Mobile-first design
- Fixed bottom navigation na wszystkich stronach
- Container max-width: 2xl (672px)
- Padding: px-4
- Sticky header na stronach szczegółowych

## 🔧 Narzędzia Developerskie

### Prisma Studio

```bash
pnpm prisma studio
```

### Sprawdzenie migracji

```bash
pnpm prisma migrate status
```

### Reset bazy (dev only!)

```bash
pnpm prisma migrate reset --force
```

## ⚠️ Ważne Uwagi

1. **Dwie schematy**: `schema.prisma` (SQLite) i `schema.prod.prisma` (PostgreSQL) muszą być synchronizowane ręcznie
2. **Migracje**: Tworzone tylko dla schema.prisma, następnie deploy na prod przez `deploy-schema.sh`
3. **Drift**: Baza dev może być resetnięta, prod wymaga ostrożności
4. **Session Cookie**: HttpOnly zapobiega XSS, SameSite=Strict zapobiega CSRF
5. **Hasła**: Zawsze hashowane przez bcrypt przed zapisem
6. **Date Handling**: Wszystkie daty normalizowane do 00:00:00 dla spójności

## 📊 Monitoring & Debugging

- Wszystkie błędy są logowane przez `console.error` z kontekstem
- API routes zwracają spójne formaty błędów
- TypeScript strict mode włączony
- ESLint konfiguracja dla Next.js

## 🔮 Przyszłe Usprawnienia

- [ ] Statystyki i wykresy postępów
- [ ] Powiadomienia push
- [ ] Export danych do CSV
- [ ] Integracja z aplikacjami fitness
- [ ] Tryb ciemny
- [ ] PWA support
- [ ] Współdzielenie postępów w social media
