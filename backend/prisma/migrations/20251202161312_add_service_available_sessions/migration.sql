-- AlterTable
ALTER TABLE "services" ADD COLUMN     "availableSessions" TEXT[] DEFAULT ARRAY['morning', 'afternoon', 'evening']::TEXT[];
