-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'CheckCircle',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyTaskId" TEXT NOT NULL,
    "taskTemplateId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskCompletion_dailyTaskId_fkey" FOREIGN KEY ("dailyTaskId") REFERENCES "DailyTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskCompletion_taskTemplateId_fkey" FOREIGN KEY ("taskTemplateId") REFERENCES "TaskTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DietMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kcal" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "fat" REAL NOT NULL,
    "carbs" REAL NOT NULL,
    "ingredients" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DietMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TaskTemplate_userId_idx" ON "TaskTemplate"("userId");

-- CreateIndex
CREATE INDEX "TaskTemplate_userId_isActive_idx" ON "TaskTemplate"("userId", "isActive");

-- CreateIndex
CREATE INDEX "TaskCompletion_dailyTaskId_idx" ON "TaskCompletion"("dailyTaskId");

-- CreateIndex
CREATE INDEX "TaskCompletion_taskTemplateId_idx" ON "TaskCompletion"("taskTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_dailyTaskId_taskTemplateId_key" ON "TaskCompletion"("dailyTaskId", "taskTemplateId");

-- CreateIndex
CREATE INDEX "DietMeal_userId_idx" ON "DietMeal"("userId");

-- CreateIndex
CREATE INDEX "DietMeal_userId_day_idx" ON "DietMeal"("userId", "day");
