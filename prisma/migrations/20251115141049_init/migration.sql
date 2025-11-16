-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "steps" BOOLEAN NOT NULL DEFAULT false,
    "training" BOOLEAN NOT NULL DEFAULT false,
    "diet" BOOLEAN NOT NULL DEFAULT false,
    "book" BOOLEAN NOT NULL DEFAULT false,
    "learning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Spending" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dailyTaskId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Spending_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Spending_dailyTaskId_fkey" FOREIGN KEY ("dailyTaskId") REFERENCES "DailyTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "DailyTask_userId_idx" ON "DailyTask"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyTask_userId_date_key" ON "DailyTask"("userId", "date");

-- CreateIndex
CREATE INDEX "Spending_userId_idx" ON "Spending"("userId");

-- CreateIndex
CREATE INDEX "Spending_dailyTaskId_idx" ON "Spending"("dailyTaskId");
