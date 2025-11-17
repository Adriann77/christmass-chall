# 📖 Christmas Challenge - Developer Onboarding Guide

## Witaj w zespole! 👋

Ten dokument pomoże Ci szybko zrozumieć projekt i zacząć pracę.

## 🎯 Co To Jest?

Christmas Challenge to aplikacja webowa do śledzenia nawyków i wyzwań w okresie przedświątecznym. Użytkownicy mogą:

- ✅ Wykonywać 6 codziennych zadań (kroki, trening, dieta, książka, nauka, woda)
- 💰 Śledzić wydatki
- 📅 Przeglądać historię w kalendarzu
- 🍎 Sprawdzać 7-dniowy plan diety z makroskładnikami

## 🚀 Quick Start (5 minut)

```bash
# 1. Sklonuj repo
git clone https://github.com/Adriann77/christmass-chall.git
cd christmas-chall

# 2. Zainstaluj zależności
pnpm install

# 3. Skonfiguruj bazę danych
cp .env.example .env
npx prisma generate
npx prisma migrate dev

# 4. Uruchom serwer dev
pnpm dev

# 5. Otwórz w przeglądarce
open http://localhost:3000
```

Gotowe! Aplikacja działa lokalnie. 🎉

## 📁 Gdzie Jest Co?

### 🎨 Frontend (Pages)

- `/app/login` - Strona logowania
- `/app/register` - Rejestracja
- `/app/dashboard/page.tsx` - **Główny dashboard z zadaniami**
- `/app/dashboard/spending/page.tsx` - Wydatki
- `/app/dashboard/calendar/page.tsx` - Kalendarz miesięczny
- `/app/dashboard/diet/page.tsx` - Lista dni diety
- `/app/dashboard/diet/[day]/page.tsx` - Szczegóły dnia z posiłkami

### 🔌 Backend (API Routes)

- `/app/api/auth/*` - Autentykacja (login, register, logout, me)
- `/app/api/tasks/today` - GET: Pobierz dzisiejsze zadania
- `/app/api/tasks/[id]` - PATCH: Aktualizuj zadanie
- `/app/api/calendar` - GET: Historia zadań (kalendarz)
- `/app/api/spendings` - GET/POST: Wydatki

### 🗄️ Baza Danych

- `/prisma/schema.prisma` - Schema SQLite (development)
- `/prisma/schema.prod.prisma` - Schema PostgreSQL (production)
- `/prisma/migrations/` - Historia migracji
- `/prisma/dev.db` - Lokalna baza SQLite

### 🧩 Komponenty UI

- `/components/ui/*` - shadcn/ui komponenty
- Wszystkie są już skonfigurowane i gotowe do użycia

### 📊 Dane

- `/app/data/diet.json` - Statyczny 7-dniowy plan diety

## 🔧 Podstawowe Komendy

```bash
# Development
pnpm dev              # Uruchom serwer dev (Turbopack)
pnpm build            # Build produkcyjny
pnpm start            # Start produkcyjnego buildu
pnpm lint             # Linting

# Prisma
pnpm prisma:generate  # Generuj Prisma Client
pnpm prisma:migrate   # Utwórz migrację (dev)
pnpm prisma:studio    # Otwórz Prisma Studio (GUI dla bazy)

# Database
npx prisma migrate dev --name nazwa_migracji
npx prisma migrate reset --force  # Reset dev DB
npx prisma db push --schema=prisma/schema.prod.prisma  # Push do prod
```

## 🏗️ Struktura Kodu - Najważniejsze Pliki

### 1. Dashboard z Zadaniami (`app/dashboard/page.tsx`)

```typescript
// Główna logika:
// - Pobiera DailyTask dla dzisiejszej daty
// - Wyświetla 6 checkboxów dla zadań
// - Progress bar pokazuje % ukończenia
// - Licznik dni do Świąt

const tasks = [
  { key: 'steps', label: '10 000 kroków', icon: TrendingUp },
  { key: 'training', label: 'Trening/Rozciąganie', icon: Dumbbell },
  { key: 'diet', label: 'Zdrowa dieta', icon: Apple },
  { key: 'book', label: 'Czytanie książki', icon: Book },
  { key: 'learning', label: 'Nauka (1 godzina)', icon: GraduationCap },
  { key: 'water', label: '2.5 litra wody', icon: Droplet },
];
```

### 2. API Route dla Zadań (`app/api/tasks/today/route.ts`)

```typescript
// GET /api/tasks/today
// - Sprawdza sesję
// - Znajduje lub tworzy DailyTask dla dzisiejszego dnia
// - Zwraca z includowanymi wydatkami

// Kluczowa logika:
const currentDate = new Date(...);
currentDate.setHours(0, 0, 0, 0);  // Normalizacja do 00:00

const dailyTask = await prisma.dailyTask.findUnique({
  where: { userId_date: { userId, date: currentDate } }
});
```

### 3. Autentykacja (`lib/auth.ts`)

```typescript
// loginUser() - weryfikuje hasło, tworzy sesję
// getUserById() - pobiera użytkownika z ID
// hashPassword() - bcrypt hashing
// verifyPassword() - bcrypt verification
```

### 4. Prisma Client (`lib/prisma.ts`)

```typescript
// Singleton pattern - jedna instancja Prisma Client
// Automatycznie używa DATABASE_URL z .env
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
```

## 🗺️ Typowe Przepływy (User Flows)

### Logowanie Użytkownika

```
1. User → /login
2. Submit form → POST /api/auth/login
3. Backend → weryfikacja w DB (lib/auth.ts)
4. Backend → utwórz session cookie
5. Redirect → /dashboard
6. Dashboard → GET /api/tasks/today
7. Renderuj UI z danymi
```

### Aktualizacja Zadania

```
1. User kliknie checkbox
2. Frontend → PATCH /api/tasks/[id]
   Body: { training: true }
3. Backend → sprawdź uprawnienia
4. Backend → update w DB
5. Frontend → otrzymuje zaktualizowane dane
6. Frontend → re-render UI (optimistic update)
```

### Dodawanie Wydatku

```
1. User → kliknie "+" w /dashboard/spending
2. Otwiera się dialog (shadcn Dialog)
3. User wypełnia formularz
4. Submit → POST /api/spendings
   Body: { amount, category, description }
5. Backend → tworzy Spending z dailyTaskId
6. Frontend → odświeża listę wydatków
```

## 🎨 Style Guide

### Tailwind Classes (Najczęściej Używane)

```tsx
// Karty
<Card className='border-2 hover:shadow-lg'>

// Przyciski
<Button variant='ghost' size='icon'>

// Layout
<div className='container mx-auto px-4 py-6 max-w-2xl'>

// Grid
<div className='grid grid-cols-2 gap-4'>

// Animacje (Framer Motion)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

### Kolory Semantyczne

```css
/* Makroskładniki (Dieta) */
text-blue-600    /* Białko */
text-yellow-600  /* Tłuszcz */
text-green-600   /* Węglowodany */
text-orange-500  /* Kalorie */

/* Status */
text-primary     /* Aktywny element */
text-muted-foreground  /* Nieaktywny */
bg-accent        /* Ukończone zadanie */
```

## 🧪 Testowanie Lokalnie

### Tworzenie Testowego Użytkownika

```bash
# Opcja 1: Przez UI
# Idź do http://localhost:3000/register

# Opcja 2: Przez Prisma Studio
npx prisma studio
# Dodaj User ręcznie (pamiętaj o hashowaniu hasła!)

# Opcja 3: Seed script (jeśli istnieje)
npx prisma db seed
```

### Reset Bazy i Zaczynanie Od Nowa

```bash
npx prisma migrate reset --force
# To:
# 1. Usuwa dev.db
# 2. Tworzy nową bazę
# 3. Aplikuje wszystkie migracje
# 4. Uruchamia seed (jeśli istnieje)
```

### Debugowanie

```typescript
// W API routes:
console.log('Debug data:', data);

// W komponentach:
console.log('State:', dailyTask);

// Sprawdź Network tab w DevTools:
// - Status codes
// - Request/Response bodies
// - Cookies (sesja)
```

## 🐛 Częste Problemy i Rozwiązania

### Problem: "P6001 - Connection error"

```bash
# Sprawdź DATABASE_URL w .env
cat .env | grep DATABASE_URL

# Powinno być:
DATABASE_URL="file:./prisma/dev.db"

# NIE:
DATABASE_URL="file:./dev.db"  # ❌ Zła ścieżka
```

**Rozwiązanie**:

```bash
# Popraw .env
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env

# Regeneruj
npx prisma generate
rm -rf .next
pnpm dev
```

### Problem: TypeScript nie widzi nowego pola w modelu

```bash
# Po zmianie schema.prisma ZAWSZE:
npx prisma generate
rm -rf .next node_modules/.cache
pnpm dev
```

### Problem: "Unauthorized" w API

```bash
# Sprawdź cookie w DevTools → Application → Cookies
# Powinien być "session" cookie

# Jeśli nie ma - zaloguj się ponownie
# Jeśli dalej problem - sprawdź lib/auth.ts
```

### Problem: Drift detection

```bash
# Baza jest niezsynchronizowana z migracjami
npx prisma migrate reset --force

# To zresetuje dev.db do czystego stanu
```

## 📚 Jak Dodać Nową Funkcję? (Przykład)

Załóżmy, że chcesz dodać pole "mood" (nastrój) do DailyTask:

### 1. Zaktualizuj Schema

```prisma
// prisma/schema.prisma
model DailyTask {
  // ... existing fields
  mood String?  // "happy", "neutral", "sad"
}
```

### 2. Utwórz Migrację

```bash
npx prisma migrate dev --name add_mood_to_daily_task
```

### 3. Zaktualizuj Interface

```typescript
// app/dashboard/page.tsx
interface DailyTask {
  // ... existing fields
  mood?: string;
}
```

### 4. Dodaj UI

```tsx
// Dodaj selector nastroju
<select onChange={(e) => handleMoodChange(e.target.value)}>
  <option value='happy'>😊 Szczęśliwy</option>
  <option value='neutral'>😐 Neutralny</option>
  <option value='sad'>😢 Smutny</option>
</select>
```

### 5. Zaktualizuj API

```typescript
// app/api/tasks/[id]/route.ts
const updatedTask = await prisma.dailyTask.update({
  where: { id },
  data: {
    // ... existing fields
    mood: body.mood ?? task.mood,
  },
});
```

### 6. Test!

```bash
pnpm dev
# Otwórz http://localhost:3000/dashboard
# Wybierz nastrój i sprawdź czy zapisuje się
```

## 🔐 Bezpieczeństwo - Dobre Praktyki

### DO ✅

- Zawsze weryfikuj sesję w API routes
- Używaj `HttpOnly` cookies dla sesji
- Hashuj hasła przez bcrypt (NIGDY plain text)
- Sanityzuj input użytkownika
- Używaj Prisma (chroni przed SQL injection)

### NIE RÓB ❌

- Nie commituj `.env` do git
- Nie loguj haseł (nawet w dev)
- Nie używaj `eval()` z user input
- Nie wyłączaj TypeScript strict mode
- Nie pushuj wrażliwych danych do repo

## 🎓 Przydatne Materiały

### Dokumentacja Tech Stack

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)

### Nasze Dokumenty

- `ARCHITECTURE.md` - Pełna architektura projektu
- `PRISMA_MIGRATION_GUIDE.md` - Jak migrować schemat na prod
- `DATABASE_SETUP.md` - Setup bazy danych (jeśli istnieje)

### Przydatne Narzędzia

- [Prisma Studio](https://www.prisma.io/studio) - GUI dla bazy
- [Thunder Client](https://www.thunderclient.com/) - Testowanie API (VS Code)
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 🤝 Jak Przyczynić Się do Projektu?

### Workflow

```bash
# 1. Utwórz branch
git checkout -b feature/nazwa-funkcji

# 2. Commit changes
git add .
git commit -m "feat: dodaj pole mood do DailyTask"

# 3. Push
git push origin feature/nazwa-funkcji

# 4. Utwórz Pull Request na GitHub
```

### Commit Message Convention

```
feat: nowa funkcja
fix: naprawa buga
docs: dokumentacja
style: formatowanie
refactor: refaktoryzacja
test: testy
chore: maintenance
```

## 📞 Potrzebujesz Pomocy?

### Sprawdź najpierw:

1. Czy błąd jest w console (DevTools)?
2. Czy baza działa? (Prisma Studio)
3. Czy sesja jest aktywna? (DevTools → Cookies)
4. Czy schema jest zsynchronizowana? (`prisma migrate status`)

### Nadal problem?

- 📖 Przeczytaj `ARCHITECTURE.md`
- 🔍 Przeszukaj Issues na GitHub
- 💬 Zapytaj zespół na Slack/Discord
- 📧 Kontakt: adrian@example.com

## 🎯 Następne Kroki

Po przeczytaniu tego dokumentu powinieneś:

1. ✅ Uruchomić projekt lokalnie
2. ✅ Zrozumieć podstawową strukturę
3. ✅ Wiedzieć gdzie szukać kodu dla konkretnych funkcji
4. ✅ Umieć dodać prostą zmianę

**Teraz**:

- 👀 Poexploruj kod w `/app/dashboard/page.tsx`
- 🧪 Przetestuj dodanie nowego zadania
- 📖 Przeczytaj `PRISMA_MIGRATION_GUIDE.md` (jeśli będziesz zmieniać schemat)
- 🎨 Sprawdź komponenty w `/components/ui/`

---

**Powodzenia! 🚀**

Jeśli masz pytania, nie wahaj się zapytać. Wszyscy kiedyś zaczynaliśmy!

_Last updated: 2025-11-17_
