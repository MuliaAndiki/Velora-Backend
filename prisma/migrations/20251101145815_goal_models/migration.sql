-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" INTEGER NOT NULL,
    "savedAmount" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "UserID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
