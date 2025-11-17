# 🚀 Prisma Migration Guide - Production Deployment

## Przegląd Procesu

Ten dokument opisuje dokładny proces migracji zmian w schemacie Prisma na środowisko produkcyjne. **UWAGA**: Ta aplikacja używa dwóch osobnych schematów - SQLite dla dev i PostgreSQL dla prod.

## ⚠️ WAŻNE: Dwuschematowa Architektura

```
prisma/
├── schema.prisma      → SQLite (Development)
└── schema.prod.prisma → PostgreSQL (Production)
```

**Kluczowa zasada**: Zmiany muszą być aplikowane NA OBIE schematy ręcznie!

## 📋 Checklist Pre-Migration

Przed rozpoczęciem migracji upewnij się, że:

- [ ] Masz backup bazy produkcyjnej (jeśli to możliwe)
- [ ] Zmiana jest przetestowana lokalnie
- [ ] Zmienne środowiskowe są ustawione (DATABASE_URL_PROD, DATABASE_URL_DIRECT)
- [ ] Masz dostęp do Prisma Console (dla monitoringu)
- [ ] Aplikacja produkcyjna może być zatrzymana (jeśli breaking change)

## 🔄 Proces Krok Po Kroku

### ETAP 1: Modyfikacja Schema Development

1. **Edytuj `prisma/schema.prisma`** (SQLite version)

   ```prisma
   model DailyTask {
     // ... istniejące pola
     water Boolean @default(false)  // NOWE POLE
   }
   ```

2. **Utwórz migrację deweloperską**

   ```bash
   npx prisma migrate dev --name add_water_to_daily_task
   ```

   To automatycznie:

   - Utworzy plik migracji SQL
   - Zaaplikuje go na dev.db
   - Zregeneruje Prisma Client

3. **Przetestuj lokalnie**

   ```bash
   npm run dev
   ```

   Upewnij się, że:

   - Aplikacja się kompiluje
   - Nowe pole jest dostępne w TypeScript
   - API działa poprawnie
   - UI aktualizuje się prawidłowo

### ETAP 2: Synchronizacja Schema Production

4. **Ręcznie zaktualizuj `prisma/schema.prod.prisma`**

   ```prisma
   // To samo co w schema.prisma, ALE z:
   datasource db {
     provider = "postgresql"  // ← NIE sqlite
     url      = env("DATABASE_URL")
     directUrl = env("DATABASE_URL_DIRECT")
   }

   model DailyTask {
     // ... istniejące pola
     water Boolean @default(false)  // TA SAMA ZMIANA
   }
   ```

5. **Zweryfikuj różnice**

   ```bash
   diff prisma/schema.prisma prisma/schema.prod.prisma
   ```

   Jedyne różnice powinny być w sekcji `datasource db`.

### ETAP 3: Aktualizacja Kodu Aplikacji

6. **Zaktualizuj TypeScript interfaces**

   Przykład: `app/dashboard/page.tsx`

   ```typescript
   interface DailyTask {
     // ... istniejące pola
     water: boolean; // DODAJ
   }

   const tasks = [
     // ... istniejące zadania
     { key: 'water', label: '2.5 litra wody', icon: Droplet },
   ];
   ```

7. **Zaktualizuj API routes**

   Przykład: `app/api/tasks/[id]/route.ts`

   ```typescript
   const updatedTask = await prisma.dailyTask.update({
     where: { id },
     data: {
       // ... istniejące pola
       water: body.water ?? task.water, // DODAJ
     },
   });
   ```

8. **Zregeneruj Prisma Client**

   ```bash
   npx prisma generate
   ```

9. **Wyczyść cache Next.js**
   ```bash
   rm -rf .next
   rm -rf node_modules/.cache
   ```

### ETAP 4: Deploy na Production

10. **Ustaw zmienne środowiskowe**

    ```bash
    # W terminalu lub dodaj do .env
    export DATABASE_URL_PROD="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
    export DATABASE_URL_DIRECT="postgres://user:pass@host:port/db?sslmode=require"
    ```

11. **Uruchom deployment script**

    ```bash
    bash scripts/deploy-schema.sh
    ```

    Skrypt wykona:

    - Walidację zmiennych środowiskowych
    - Potwierdzenie użytkownika (Y/N)
    - `prisma db push --schema=prisma/schema.prod.prisma`
    - Generowanie Prisma Client dla prod

12. **Monitoruj deployment**

    Sprawdź output:

    ```
    ✅ Your database is now in sync with your Prisma schema.
    ✅ Generated Prisma Client
    ```

### ETAP 5: Weryfikacja

13. **Sprawdź schema w Prisma Studio** (opcjonalnie)

    ```bash
    # Dla prod (ustaw DATABASE_URL na prod URL)
    DATABASE_URL=$DATABASE_URL_PROD npx prisma studio --schema=prisma/schema.prod.prisma
    ```

14. **Test smoke na produkcji**
    - Zaloguj się do aplikacji
    - Sprawdź czy nowe pole się wyświetla
    - Przetestuj CRUD operacje
    - Sprawdź logi błędów

## 🆘 Rollback (Awaryjnie)

Jeśli coś pójdzie nie tak:

### Opcja 1: Przywróć poprzednią wersję kodu

```bash
git revert HEAD
git push origin main
# Re-deploy aplikacji
```

### Opcja 2: Usuń kolumnę z bazy (jeśli dodano pole)

```sql
-- Tylko dla non-breaking changes
ALTER TABLE "DailyTask" DROP COLUMN "water";
```

### Opcja 3: Przywróć backup bazy

```bash
# Jeśli masz backup
pg_restore -d your_database backup.sql
```

## 📝 Przykładowy Workflow: Dodawanie Pola "water"

Pełny przykład ostatnio wykonanej migracji:

```bash
# 1. Edytuj schema.prisma
vim prisma/schema.prisma  # Dodaj: water Boolean @default(false)

# 2. Utwórz migrację dev
npx prisma migrate dev --name add_water_to_daily_task

# 3. Edytuj schema.prod.prisma
vim prisma/schema.prod.prisma  # Dodaj to samo pole

# 4. Zaktualizuj kod TypeScript
vim app/dashboard/page.tsx  # Dodaj water: boolean i zadanie
vim app/api/tasks/[id]/route.ts  # Dodaj water: body.water

# 5. Regeneruj Prisma Client
npx prisma generate

# 6. Wyczyść cache
rm -rf .next

# 7. Test lokalnie
npm run dev

# 8. Deploy na prod
bash scripts/deploy-schema.sh

# 9. Deploy aplikacji (Vercel/inne)
git push origin main
```

## 🛠️ Pomocne Komendy

### Sprawdzanie statusu migracji

```bash
# Dev
npx prisma migrate status

# Prod
DATABASE_URL=$DATABASE_URL_PROD npx prisma migrate status --schema=prisma/schema.prod.prisma
```

### Reset bazy DEV (tylko dev!)

```bash
npx prisma migrate reset --force
```

### Porównanie schematów

```bash
# Sprawdź czy są zsynchronizowane
diff <(grep -v "provider\|url" prisma/schema.prisma) \
     <(grep -v "provider\|url\|directUrl" prisma/schema.prod.prisma)
```

### Generowanie SQL bez aplikacji

```bash
# Zobacz co zostanie wykonane na bazie
npx prisma db push --schema=prisma/schema.prod.prisma --dry-run
```

## ⚡ Skróty i Aliasy (opcjonalne)

Dodaj do `.zshrc` lub `.bashrc`:

```bash
# Prisma shortcuts
alias pm="npx prisma migrate"
alias pmdev="npx prisma migrate dev"
alias pg="npx prisma generate"
alias pstudio="npx prisma studio"
alias pmprod="bash scripts/deploy-schema.sh"

# Quick dev workflow
alias prismaDev="npm run prisma:migrate && npm run prisma:generate && rm -rf .next"
```

## 📊 Typy Zmian i Ich Ryzyko

| Typ Zmiany                      | Ryzyko  | Wymaga Downtime? | Notatki                           |
| ------------------------------- | ------- | ---------------- | --------------------------------- |
| Dodanie pola (nullable/default) | Niskie  | Nie              | Bezpieczne, backward compatible   |
| Dodanie pola (required)         | Wysokie | Tak              | Wymaga migracji danych            |
| Usunięcie pola                  | Wysokie | Tak              | Może złamać działającą aplikację  |
| Zmiana typu pola                | Wysokie | Tak              | Wymaga konwersji danych           |
| Dodanie indeksu                 | Średnie | Nie              | Może być wolne na dużych tabelach |
| Dodanie relacji                 | Średnie | Nie              | Sprawdź integralność danych       |
| Zmiana nazwy pola               | Wysokie | Tak              | Wymaga aktualizacji całego kodu   |

## 🎯 Best Practices

1. **Zawsze testuj lokalnie najpierw** - dev.db jest twoim playground
2. **Jedna zmiana na raz** - łatwiej debugować i rollbackować
3. **Commituj migracje** - trzymaj w git dla historii
4. **Dokumentuj breaking changes** - w commit message i CHANGELOG
5. **Używaj feature flags** - dla dużych zmian stopniowo włączaj
6. **Monitor produkcji** - sprawdzaj logi przez pierwsze 24h po deploy
7. **Backup przed dużymi zmianami** - lepiej dmuchać na zimne
8. **Testuj rollback procedure** - zanim będziesz jej potrzebować

## 🔐 Bezpieczeństwo

- ✅ Nigdy nie commituj `DATABASE_URL_PROD` do repo
- ✅ Używaj `directUrl` tylko dla migracji, nie w aplikacji
- ✅ Ograniczaj dostęp do production database
- ✅ Loguj wszystkie operacje schema changes
- ✅ Używaj read-only user dla analytics/reporting

## 📚 Przydatne Linki

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Accelerate](https://www.prisma.io/docs/accelerate)
- [PostgreSQL Migration Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🤝 Troubleshooting

### Problem: "Database schema is not in sync"

```bash
# Reset dev
npx prisma migrate reset --force

# Lub dla prod (OSTROŻNIE!)
DATABASE_URL=$DATABASE_URL_PROD npx prisma db push --schema=prisma/schema.prod.prisma --force
```

### Problem: TypeScript nie widzi nowego pola

```bash
# Regeneruj klienta i wyczyść cache
npx prisma generate
rm -rf .next node_modules/.cache
npm run dev
```

### Problem: "P6001 - Connection error"

```bash
# Sprawdź DATABASE_URL
echo $DATABASE_URL

# Dla dev powinno być:
# file:./prisma/dev.db

# Nie:
# file:./dev.db  ← ZŁA ŚCIEŻKA
```

### Problem: Drift detection podczas migrate dev

```bash
# Baza dev ma zmiany nie odzwierciedlone w migracjach
# OPCJA 1: Reset (traci dane)
npx prisma migrate reset --force

# OPCJA 2: Baseline (zachowuje dane)
npx prisma migrate resolve --applied "problematic_migration"
npx prisma migrate dev
```

---

**Ostatnia aktualizacja**: 2025-11-17  
**Autor**: Adrian  
**Wersja**: 1.0.0
