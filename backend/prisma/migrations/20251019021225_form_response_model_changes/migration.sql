/*
  Warnings:

  - You are about to drop the column `metadata` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `responderIp` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `FormResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormField" ADD COLUMN     "allowMultiple" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "metadata",
DROP COLUMN "responderIp",
DROP COLUMN "userAgent",
ADD COLUMN     "anonymousId" TEXT;
