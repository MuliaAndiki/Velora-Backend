/*
  Warnings:

  - You are about to drop the column `WalletID` on the `Goal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_WalletID_fkey";

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "WalletID",
ADD COLUMN     "walletID" TEXT;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_walletID_fkey" FOREIGN KEY ("walletID") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
