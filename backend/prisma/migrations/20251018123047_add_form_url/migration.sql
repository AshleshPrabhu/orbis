/*
  Warnings:

  - A unique constraint covering the columns `[formUrl]` on the table `Form` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `formUrl` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "formUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Form_formUrl_key" ON "Form"("formUrl");
