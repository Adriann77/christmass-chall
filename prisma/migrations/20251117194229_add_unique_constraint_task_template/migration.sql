/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `TaskTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplate_userId_name_key" ON "TaskTemplate"("userId", "name");
