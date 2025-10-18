/*
  Warnings:

  - The primary key for the `FieldAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FieldAnswer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isTemplate` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Form` table. All the data in the column will be lost.
  - The primary key for the `FormContributor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FormContributor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FormField` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FormField` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FormResponse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FormResponse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `responseId` on the `FieldAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fieldId` on the `FieldAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PermissionLevel" AS ENUM ('VIEW', 'EDIT');

-- DropForeignKey
ALTER TABLE "FieldAnswer" DROP CONSTRAINT "FieldAnswer_fieldId_fkey";

-- DropForeignKey
ALTER TABLE "FieldAnswer" DROP CONSTRAINT "FieldAnswer_responseId_fkey";

-- DropIndex
DROP INDEX "Form_slug_key";

-- AlterTable
ALTER TABLE "FieldAnswer" DROP CONSTRAINT "FieldAnswer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "responseId",
ADD COLUMN     "responseId" INTEGER NOT NULL,
DROP COLUMN "fieldId",
ADD COLUMN     "fieldId" INTEGER NOT NULL,
ADD CONSTRAINT "FieldAnswer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "isTemplate",
DROP COLUMN "slug",
ADD COLUMN     "isEditable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FormContributor" DROP CONSTRAINT "FormContributor_pkey",
ADD COLUMN     "permission" "PermissionLevel" NOT NULL DEFAULT 'VIEW',
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FormContributor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FormField" DROP CONSTRAINT "FormField_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FormField_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "FieldAnswer" ADD CONSTRAINT "FieldAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldAnswer" ADD CONSTRAINT "FieldAnswer_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
