/*
  Warnings:

  - The values [COMPLATE] on the enum `GoalType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `UserID` on the `Goal` table. All the data in the column will be lost.
  - Added the required column `userID` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletID` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `categoryID` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GoalType_new" AS ENUM ('INPROGRESS', 'COMPLETE');
ALTER TABLE "public"."Goal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Goal" ALTER COLUMN "status" TYPE "GoalType_new" USING ("status"::text::"GoalType_new");
ALTER TYPE "GoalType" RENAME TO "GoalType_old";
ALTER TYPE "GoalType_new" RENAME TO "GoalType";
DROP TYPE "public"."GoalType_old";
ALTER TABLE "Goal" ALTER COLUMN "status" SET DEFAULT 'INPROGRESS';
COMMIT;

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_UserID_fkey";

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "UserID",
ADD COLUMN     "userID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "walletID" TEXT NOT NULL,
ALTER COLUMN "categoryID" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wallet_userID_idx" ON "Wallet"("userID");

-- CreateIndex
CREATE INDEX "Category_userID_idx" ON "Category"("userID");

-- CreateIndex
CREATE INDEX "Goal_userID_idx" ON "Goal"("userID");

-- CreateIndex
CREATE INDEX "Transaction_userID_idx" ON "Transaction"("userID");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletID_fkey" FOREIGN KEY ("walletID") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
