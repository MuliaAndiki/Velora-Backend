import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import { PickCreateGoal, PickGetID } from "@/types/goal.types";
import prisma from "prisma/client";

class GoalController {
  public async createGoal(c: AppContext) {
    try {
      const go = c.body as PickCreateGoal;
      const jwtUser = c.user as JwtPayload;
      if (!go.name || !go.deadline || !go.savedAmount || !go.targetAmount) {
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

      const goal = await prisma.goal.create({
        data: {
          name: go.name,
          deadline: new Date(go.deadline),
          savedAmount: go.savedAmount,
          targetAmount: go.targetAmount,
          UserID: jwtUser.id,
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
          UserID: jwtUser.id,
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
      return c.json?.({
        status: 200,
        message: "Succesfuly Get Goall",
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

  public async getGoalByID(c: AppContext) {
    try {
      const go = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;
      if (!go.id) {
        return c.json?.(
          {
            status: 400,
            message: "Params Is Required",
          },
          400
        );
      }
      if (!jwtUser) {
        return c.json?.(
          {
            status: 400,
            message: "User Not Found",
          },
          400
        );
      }

      const goal = await prisma.goal.findMany({
        where: {
          id: go.id,
          UserID: jwtUser.id,
        },
      });

      if (!goal) {
        return c.json?.(
          {
            status: 400,
            message: "Failed Get Goal",
          },
          400
        );
      }

      return c.json?.(
        {
          status: 200,
          message: "Succes Get Data Goal",
          data: goal,
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

      const goal = await prisma.goal.deleteMany({
        where: {
          UserID: jwtUser.id,
        },
      });

      if (!goal) {
        return c.json?.(
          {
            status: 404,
            message: "Failed Delete All Goal",
          },
          404
        );
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
          UserID: jwtUser.id,
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
          UserID: jwtUser.id,
        },
        data: {
          name: go.name,
          savedAmount: go.savedAmount,
          targetAmount: go.targetAmount,
          deadline: go.deadline,
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
}

export default new GoalController();
