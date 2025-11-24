-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_WalletID_fkey";

-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "WalletID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_WalletID_fkey" FOREIGN KEY ("WalletID") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
