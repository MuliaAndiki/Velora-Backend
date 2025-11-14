-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('INPROGRESS', 'COMPLATE');

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "status" "GoalType" NOT NULL DEFAULT 'INPROGRESS';
