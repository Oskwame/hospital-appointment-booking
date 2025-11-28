-- CreateTable
CREATE TABLE "doctors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);
