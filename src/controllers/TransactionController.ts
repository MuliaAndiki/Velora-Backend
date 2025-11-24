import { AppContext } from "@/contex/app-context";
import { TransactionType } from "@prisma/client";
import { JwtPayload } from "@/types/auth.types";
import {
  JwtTransaction,
  PickCreateTransaction,
  PickID,
} from "@/types/transaction.type";
import prisma from "prisma/client";

class TransactionController {
  public async create(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      const trans = c.body as PickCreateTransaction;
      const cate = c.params as JwtTransaction;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "user not found" }, 404);
      }

      if (
        !trans.amount ||
        !trans.description ||
        !trans.receiptUrl ||
        !trans.type
      ) {
        return c.json?.({ status: 400, message: "body is required" }, 400);
      }
      if (!cate.type === !trans.type) {
        return c.json?.(
          {
            status: 400,
            message: "category type tidak sesuai",
          },
          400
        );
      }

      const wallet = await prisma.wallet.findUnique({
        where: { id: trans.walletID },
      });

      if (!wallet) {
        return c.json?.({ status: 404, message: "wallet not found" }, 404);
      }

      let newBalance = wallet.balance;
      if (trans.type === "INCOME") {
        newBalance = wallet.balance + trans.amount;
      } else if (trans.type === "EXPENSE") {
        newBalance = wallet.balance - trans.amount;

        if (newBalance < 0) {
          return c.json?.(
            { status: 400, message: "insufficient wallet balance" },
            400
          );
        }
      }

      const transaction = await prisma.transaction.create({
        data: {
          amount: trans.amount,
          description: trans.description,
          receiptUrl: trans.receiptUrl,
          type: trans.type as TransactionType,
          categoryID: cate.id,
          userID: jwtUser.id,
          walletID: trans.walletID,
        },
      });

      await prisma.wallet.update({
        where: { id: trans.walletID },
        data: { balance: newBalance },
      });

      return c.json?.(
        {
          status: 201,
          message: "success create transaction",
          data: transaction,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "server internal error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async getByUser(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }

      const transaction = await prisma.transaction.findMany({
        where: {
          userID: jwtUser.id,
        },
        include: {
          category: {},
        },
      });

      return c.json?.(
        {
          status: 200,
          message: "succesfully get transaction",
          data: transaction,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "server internal error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async getByID(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      const trans = c.params as PickID;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }

      if (!trans) {
        return c.json?.(
          {
            status: 400,
            message: "params is req",
          },
          400
        );
      }

      const transaction = await prisma.transaction.findUnique({
        where: {
          id: trans.id,
        },
        include: {
          user: {},
          category: {},
        },
      });

      return c.json?.(
        {
          status: 200,
          message: "succes get transactio",
          data: transaction,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "server internal error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async deleteAll(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }

      // Get all transactions for this user
      const transactions = await prisma.transaction.findMany({
        where: {
          userID: jwtUser.id,
        },
      });

      // Group transactions by wallet and calculate balance adjustments
      const walletAdjustments = new Map<string, number>();
      for (const transaction of transactions) {
        const currentAdjustment =
          walletAdjustments.get(transaction.walletID!) || 0;
        if (transaction.type === "INCOME") {
          walletAdjustments.set(
            transaction.walletID!,
            currentAdjustment - transaction.amount
          );
        } else if (transaction.type === "EXPENSE") {
          walletAdjustments.set(
            transaction.walletID!,
            currentAdjustment + transaction.amount
          );
        }
      }

      // Update all affected wallets
      for (const [walletId, adjustment] of walletAdjustments.entries()) {
        const wallet = await prisma.wallet.findUnique({
          where: { id: walletId },
        });
        if (wallet) {
          await prisma.wallet.update({
            where: { id: walletId },
            data: { balance: wallet.balance + adjustment },
          });
        }
      }

      // Delete all transactions
      const deletedTransactions = await prisma.transaction.deleteMany({
        where: {
          userID: jwtUser.id,
        },
      });

      return c.json?.({
        status: 201,
        message: "succesfully delete all transaction",
        data: deletedTransactions,
      });
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "server internal error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async deleteById(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      const trans = c.params as PickID;

      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }
      if (!trans) {
        return c.json?.(
          {
            status: 400,
            message: "params is required",
          },
          400
        );
      }

      // Get transaction first to get wallet and amount info
      const transaction = await prisma.transaction.findUnique({
        where: { id: trans.id },
      });

      if (!transaction) {
        return c.json?.({ status: 404, message: "transaction not found" }, 404);
      }

      // Get wallet to update balance
      const wallet = await prisma.wallet.findUnique({
        where: { id: transaction.walletID! },
      });

      if (!wallet) {
        return c.json?.({ status: 404, message: "wallet not found" }, 404);
      }

      // Calculate new balance by reversing the transaction
      let newBalance = wallet.balance;
      if (transaction.type === "INCOME") {
        newBalance = wallet.balance - transaction.amount;
      } else if (transaction.type === "EXPENSE") {
        newBalance = wallet.balance + transaction.amount;
      }

      // Delete transaction
      await prisma.transaction.delete({
        where: {
          id: trans.id,
          userID: jwtUser.id,
        },
      });

      // Update wallet balance with reversed amount
      await prisma.wallet.update({
        where: { id: transaction.walletID! },
        data: { balance: newBalance },
      });

      return c.json?.(
        {
          status: 200,
          message: "succesfully delete by id",
          data: transaction,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "server internal error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async update(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      const trans = c.params as PickID;
      // const transBody = c.body as PickCreateTransaction;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }

      if (!trans) {
        return c.json?.(
          {
            status: 400,
            message: "params is required",
          },
          400
        );
      }
      const transaction = await prisma.transaction.update({
        where: {
          id: trans.id,
          userID: jwtUser.id,
        },

        data: {},
      });
      return c.json?.(
        {
          status: 200,
          message: "succesfuly update transaction",
          data: transaction,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "server internal error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
}

export default new TransactionController();
