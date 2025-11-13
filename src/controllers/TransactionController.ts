import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import {
  PickCreateTransaction,
  PickIdCategory,
} from "@/types/transaction.type";
import prisma from "prisma/client";

class TransactionController {
  public async create(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      const trans = c.body as PickCreateTransaction;
      const cate = c.params as PickIdCategory;

      if (!cate.categoryID) {
        return c.json?.(
          {
            status: 404,
            message: "params is required",
          },
          404
        );
      }
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }
      if (
        !trans.amount ||
        !trans.description ||
        !trans.receiptUrl ||
        !trans.type
      ) {
        return c.json?.(
          {
            status: 400,
            message: "body is required",
          },
          400
        );
      }

      const categoryID = await prisma.category.findUnique({
        where: {
          id: cate.categoryID,
        },
      });

      if (!categoryID?.id) {
        return c.json?.(
          {
            status: 404,
            message: "id category not found",
          },
          404
        );
      }

      const date = new Date();
      const transaction = await prisma.transaction.create({
        data: {
          amount: trans.amount,
          date: date,
          description: trans.description,
          receiptUrl: trans.receiptUrl,
          type: "INCOME",
          categoryID: categoryID.id,
          userID: jwtUser.id,
        },
      });

      return c.json?.(
        {
          status: 201,
          message: "succes create transaction",
          data: transaction,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
}

export default new TransactionController();
