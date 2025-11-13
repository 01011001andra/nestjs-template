/*
  Warnings:

  - You are about to drop the column `balance` on the `Summary` table. All the data in the column will be lost.
  - You are about to drop the column `totalExpense` on the `Summary` table. All the data in the column will be lost.
  - You are about to drop the column `totalIncome` on the `Summary` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[telegramId]` on the table `N8N` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."N8N" ALTER COLUMN "telegramId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Summary" DROP COLUMN "balance",
DROP COLUMN "totalExpense",
DROP COLUMN "totalIncome";

-- CreateIndex
CREATE UNIQUE INDEX "N8N_telegramId_key" ON "public"."N8N"("telegramId");
