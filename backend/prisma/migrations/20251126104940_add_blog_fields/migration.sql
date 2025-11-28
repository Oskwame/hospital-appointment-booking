-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'draft';
