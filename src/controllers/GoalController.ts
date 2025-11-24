import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import {
  JwtGoal,
  PickCreateGoal,
  PickGetID,
  PickInsertGoal,
} from "@/types/goal.types";
import prisma from "prisma/client";

class GoalController {
  public async createGoal(c: AppContext) {
    try {
      const go = c.body as PickCreateGoal;
      const jwtUser = c.user as JwtPayload;
      if (!go.name || !go.endAt || !go.savedAmount || !go.targetAmount) {
        return c.json?.(
          {
            status: 404,
            message: "Body Is Required",
          },
          404
        );
      }

      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }

      const endAt = new Date(go.endAt);
      const startAt = new Date(go.startAt);
      const now = new Date();

      if (startAt < now) {
        return c.json?.(
          {
            status: 400,
            message: "date start not valid",
          },
          400
        );
      }
      if (endAt <= startAt) {
        return c.json?.(
          {
            status: 400,
            message: "date end not valid",
          },
          400
        );
      }

      const goal = await prisma.goal.create({
        data: {
          name: go.name,
          endAt: endAt,
          startAt: startAt,
          savedAmount: go.savedAmount,
          targetAmount: go.targetAmount,
          userID: jwtUser.id,
          status: "INPROGRESS",
        },
      });

      if (!goal) {
        return c.json?.(
          {
            status: 400,
            message: "Failed Create Goal",
          },
          400
        );
      }

      return c.json?.(
        {
          status: 201,
          message: "Goal Create Successfully",
          data: goal,
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

  public async getGoalAll(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          400
        );
      }

      const goal = await prisma.goal.findMany({
        where: {
          userID: jwtUser.id,
        },
      });

      if (!goal) {
        return c.json?.(
          {
            status: 400,
            message: "Failed GetGoal",
          },
          400
        );
      }

      const result = goal.map((goal) => {
        const percent = Math.min(
          100,
          Math.round((goal.savedAmount / goal.targetAmount) * 100)
        );

        return {
          id: goal.id,
          name: goal.name,
          endAt: goal.endAt,
          startAt: goal.startAt,
          status: goal.status,
          savedAmount: goal.savedAmount,
          targetAmount: goal.targetAmount,
          percent,
        } as JwtGoal & { percent: number };
      });

      return c.json?.({
        status: 200,
        message: "Succesfuly Get Goall",
        data: result,
      });
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

  public async deleteGoalAll(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }

      // Get all goals first to calculate wallet returns
      const goalsToDelete = await prisma.goal.findMany({
        where: {
          userID: jwtUser.id,
        },
      });

      // Delete all goals
      const goal = await prisma.goal.deleteMany({
        where: {
          userID: jwtUser.id,
        },
      });

      if (!goal || goal.count === 0) {
        return c.json?.(
          {
            status: 404,
            message: "Failed Delete All Goal",
          },
          404
        );
      }

      // Return saved amounts to wallets if walletID provided in body
      const walletAdjustments = (c.body as any)?.walletAdjustments;
      if (walletAdjustments && Array.isArray(walletAdjustments)) {
        for (const adj of walletAdjustments) {
          const wallet = await prisma.wallet.findUnique({
            where: { id: adj.walletID },
          });

          if (wallet) {
            await prisma.wallet.update({
              where: { id: adj.walletID },
              data: { balance: wallet.balance + adj.amount },
            });
          }
        }
      }

      return c.json?.(
        {
          status: 200,
          message: "Succesfuly Delete All Goal",
          data: goal,
        },
        200
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
  public async deleteGoalByID(c: AppContext) {
    try {
      const go = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;
      const walletID = (c.body as any)?.walletID;

      if (!go) {
        return c.json?.(
          {
            status: 404,
            message: "Params Is Required",
          },
          404
        );
      }
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }

      const goal = await prisma.goal.delete({
        where: {
          id: go.id,
          userID: jwtUser.id,
        },
      });

      if (!goal) {
        return c.json?.(
          {
            status: 400,
            message: "Failed Delete Goal",
          },
          400
        );
      }

      // If walletID provided, return the saved amount to wallet
      if (walletID && goal.savedAmount > 0) {
        const wallet = await prisma.wallet.findUnique({
          where: { id: walletID },
        });

        if (wallet) {
          await prisma.wallet.update({
            where: { id: walletID },
            data: { balance: wallet.balance + goal.savedAmount },
          });
        }
      }

      return c.json?.({
        status: 200,
        message: "Succesfuly Delete Goal",
        data: goal,
      });
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
  public async EditGoal(c: AppContext) {
    try {
      const go = c.body as PickCreateGoal;
      const params = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!params) {
        return c.json?.(
          {
            status: 400,
            message: "Params IsRequired",
          },
          400
        );
      }
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }
      const goal = await prisma.goal.update({
        where: {
          id: params.id,
          userID: jwtUser.id,
        },
        data: {
          name: go.name,
          savedAmount: go.savedAmount,
          targetAmount: go.targetAmount,
        },
      });

      if (!goal) {
        return c.json?.(
          {
            status: 400,
            message: "Failed Edit Goal",
          },
          400
        );
      }

      return c.json?.(
        {
          status: 200,
          message: "Succesfully Edit Goal",
          data: goal,
        },
        200
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

  public async getGoalByID(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      const go = c.params as PickGetID;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "User Not Found",
          },
          404
        );
      }
      if (!go) {
        return c.json?.(
          {
            status: 404,
            message: "ID Goal Not Found",
          },
          404
        );
      }

      const goal = await prisma.goal.findFirst({
        where: {
          userID: jwtUser.id,
          id: go.id,
        },
      });

      if (!goal) {
        return c.json?.(
          {
            status: 404,
            message: "Goal Not Found",
          },
          404
        );
      }

      const percent = Math.min(
        100,
        Math.round((goal.savedAmount / goal.targetAmount) * 100)
      );

      const result = {
        id: goal.id,
        name: goal.name,
        endAt: goal.endAt,
        savedAmount: goal.savedAmount,
        targetAmount: goal.targetAmount,
        startAt: goal.startAt,
        status: goal.status,
        percent,
      };

      return c.json?.({
        status: 200,
        message: "Progres Goal Can Get",
        data: result,
      });
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

  public async getGoalProgresAll(c: AppContext) {
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

      const goal = await prisma.goal.findMany({
        where: {
          userID: jwtUser.id,
        },
      });

      if (goal.length === 0) {
        return c.json?.(
          {
            status: 200,
            message: "no goals found",
            data: {
              targetAmount: 0,
              saveAmount: 0,
              percent: 0,
            },
          },
          200
        );
      }

      const targetAmount = goal.reduce((acc, g) => acc + g.targetAmount, 0);
      const saveAmount = goal.reduce((acc, g) => acc + g.savedAmount, 0);
      const percent =
        targetAmount > 0
          ? Math.min(100, Math.round((saveAmount / targetAmount) * 100))
          : 0;
      return c.json?.(
        {
          status: 200,
          message: "progress bar all",
          data: {
            targetAmount,
            saveAmount,
            percent,
          },
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  public async insertGoal(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      const go = c.body as PickInsertGoal;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "user not found" }, 404);
      }

      if (!go.savedAmount || !go.id || !go.WalletID) {
        return c.json?.({ status: 400, message: "body is required" }, 400);
      }

      const goal = await prisma.goal.findUnique({
        where: { id: go.id },
      });
      if (!goal) {
        return c.json?.({ status: 404, message: "goal not found" }, 404);
      }

      if (goal.userID !== jwtUser.id) {
        return c.json?.({ status: 403, message: "unauthorized" }, 403);
      }

      const wallet = await prisma.wallet.findUnique({
        where: { id: go.WalletID },
      });
      if (!wallet) {
        return c.json?.({ status: 404, message: "wallet not found" }, 404);
      }

      if (wallet.balance < go.savedAmount) {
        return c.json?.(
          { status: 400, message: "insufficient wallet balance" },
          400
        );
      }

      const newSavedAmount = goal.savedAmount + go.savedAmount;
      if (newSavedAmount > goal.targetAmount) {
        return c.json?.(
          { status: 400, message: "saved amount exceeds target amount" },
          400
        );
      }

      const updatedGoal = await prisma.goal.update({
        where: { id: go.id },
        data: {
          savedAmount: newSavedAmount,
          status:
            newSavedAmount >= goal.targetAmount ? "COMPLETE" : "INPROGRESS",
        },
      });

      await prisma.wallet.update({
        where: { id: go.WalletID },
        data: { balance: wallet.balance - go.savedAmount },
      });

      return c.json?.(
        {
          status: 200,
          message: "successfully inserted to goal",
          data: updatedGoal,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}

export default new GoalController();
