import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import {
  PickCreateTransaction,
  PickID,
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

      const transaction = await prisma.transaction.create({
        data: {
          amount: trans.amount,
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
      const transaction = await prisma.transaction.deleteMany({
        where: {
          userID: jwtUser.id,
        },
      });

      return c.json?.({
        status: 201,
        message: "succesfully delete all transaction",
        data: transaction,
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

      const transaction = await prisma.transaction.delete({
        where: {
          id: trans.id,
          userID: jwtUser.id,
        },
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
