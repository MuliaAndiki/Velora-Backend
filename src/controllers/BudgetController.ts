import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import {
  PickCreateBudget,
  PickGetID,
  PickUpdateBudget,
} from "@/types/budget.types";
import prisma from "prisma/client";

class BudgetController {
  public async create(c: AppContext) {
    try {
      const budget = c.body as PickCreateBudget;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User not found" }, 404);
      }

      if (!budget.name || !budget.categoryID || !budget.limit) {
        return c.json?.(
          { status: 400, message: "Name, category, and limit are required" },
          400
        );
      }

      const user = await prisma.user.findUnique({ where: { id: jwtUser.id } });
      if (!user) {
        return c.json?.({ status: 404, message: "User not found" }, 404);
      }

      const category = await prisma.category.findUnique({
        where: { id: budget.categoryID, userID: jwtUser.id },
      });

      if (!category) {
        return c.json?.({ status: 404, message: "Category not found" }, 404);
      }

      const newBudget = await prisma.budget.create({
        data: {
          name: budget.name,
          categoryID: budget.categoryID,
          limit: budget.limit,
          period: budget.period || "MONTHLY",
          startDate: budget.startDate,
          endDate: budget.endDate,
          userID: jwtUser.id,
        },
        include: {
          category: true,
        },
      });

      return c.json?.(
        { status: 201, message: "Success create budget", data: newBudget },
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

  public async getAll(c: AppContext) {
    try {
      const user = c.user as JwtPayload;
      if (!user) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      const budgets = await prisma.budget.findMany({
        where: { userID: user.id },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      });

      return c.json?.(
        {
          status: 200,
          message: "Success get all budgets",
          data: budgets,
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

  public async getById(c: AppContext) {
    try {
      const { id } = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      if (!id) {
        return c.json?.({ status: 400, message: "ID is required" }, 400);
      }

      const budget = await prisma.budget.findUnique({
        where: { id, userID: jwtUser.id },
        include: { category: true },
      });

      if (!budget) {
        return c.json?.({ status: 404, message: "Budget not found" }, 404);
      }

      return c.json?.(
        {
          status: 200,
          message: "Success get budget",
          data: budget,
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

  public async update(c: AppContext) {
    try {
      const { id } = c.params as PickGetID;
      const updates = c.body as PickUpdateBudget;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      if (!id) {
        return c.json?.({ status: 400, message: "ID is required" }, 400);
      }

      const budget = await prisma.budget.update({
        where: { id, userID: jwtUser.id },
        data: updates,
        include: { category: true },
      });

      return c.json?.(
        {
          status: 200,
          message: "Success update budget",
          data: budget,
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

  public async deleteById(c: AppContext) {
    try {
      const { id } = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      if (!id) {
        return c.json?.({ status: 400, message: "ID is required" }, 400);
      }

      const budget = await prisma.budget.delete({
        where: { id, userID: jwtUser.id },
        include: { category: true },
      });

      return c.json?.(
        {
          status: 200,
          message: "Success delete budget",
          data: budget,
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

  public async getBudgetProgress(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      const budgets = await prisma.budget.findMany({
        where: { userID: jwtUser.id },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      });

      // Calculate progress for each budget
      const budgetProgress = budgets.map((budget) => {
        const percentage =
          budget.limit > 0
            ? Math.round((budget.spent / budget.limit) * 100)
            : 0;
        const remaining = budget.limit - budget.spent;
        const isExceeded = budget.spent > budget.limit;

        return {
          ...budget,
          percentage,
          remaining,
          isExceeded,
          status:
            percentage >= 100
              ? "EXCEEDED"
              : percentage >= 90
              ? "WARNING"
              : "NORMAL",
        };
      });

      return c.json?.(
        {
          status: 200,
          message: "Success get budget progress",
          data: budgetProgress,
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

  public async getBudgetProgressById(c: AppContext) {
    try {
      const { id } = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      if (!id) {
        return c.json?.({ status: 400, message: "ID is required" }, 400);
      }

      const budget = await prisma.budget.findUnique({
        where: { id, userID: jwtUser.id },
        include: { category: true },
      });

      if (!budget) {
        return c.json?.({ status: 404, message: "Budget not found" }, 404);
      }

      const percentage =
        budget.limit > 0 ? Math.round((budget.spent / budget.limit) * 100) : 0;
      const remaining = budget.limit - budget.spent;
      const isExceeded = budget.spent > budget.limit;

      const budgetProgress = {
        ...budget,
        percentage,
        remaining,
        isExceeded,
        status:
          percentage >= 100
            ? "EXCEEDED"
            : percentage >= 90
            ? "WARNING"
            : "NORMAL",
      };

      return c.json?.(
        {
          status: 200,
          message: "Success get budget progress",
          data: budgetProgress,
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

export default new BudgetController();
