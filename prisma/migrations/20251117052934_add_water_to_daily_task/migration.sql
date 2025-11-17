-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "steps" BOOLEAN NOT NULL DEFAULT false,
    "training" BOOLEAN NOT NULL DEFAULT false,
    "diet" BOOLEAN NOT NULL DEFAULT false,
    "book" BOOLEAN NOT NULL DEFAULT false,
    "learning" BOOLEAN NOT NULL DEFAULT false,
    "water" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DailyTask" ("book", "createdAt", "date", "diet", "id", "learning", "steps", "training", "updatedAt", "userId") SELECT "book", "createdAt", "date", "diet", "id", "learning", "steps", "training", "updatedAt", "userId" FROM "DailyTask";
DROP TABLE "DailyTask";
ALTER TABLE "new_DailyTask" RENAME TO "DailyTask";
CREATE INDEX "DailyTask_userId_idx" ON "DailyTask"("userId");
CREATE UNIQUE INDEX "DailyTask_userId_date_key" ON "DailyTask"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
