/*
  Warnings:

  - You are about to drop the column `department` on the `doctors` table. All the data in the column will be lost.
  - Added the required column `service` to the `doctors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: First add the service column with a default, copy data, then drop department
ALTER TABLE "doctors" ADD COLUMN "service" TEXT;

-- Copy existing department values to service
UPDATE "doctors" SET "service" = "department";

-- Make service column NOT NULL
ALTER TABLE "doctors" ALTER COLUMN "service" SET NOT NULL;

-- Drop the department column
ALTER TABLE "doctors" DROP COLUMN "department";
