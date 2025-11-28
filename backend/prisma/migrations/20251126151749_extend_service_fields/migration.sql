-- AlterTable
ALTER TABLE "services" ADD COLUMN     "availableDates" TIMESTAMP(3)[] DEFAULT ARRAY[]::TIMESTAMP(3)[],
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "timeSlots" TEXT[] DEFAULT ARRAY[]::TEXT[];
