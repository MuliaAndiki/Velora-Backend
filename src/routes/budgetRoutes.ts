import { AppContext } from "@/contex/app-context";
import BudgetController from "@/controllers/BudgetController";
import { verifyToken } from "@/middlewares/auth";
import Elysia from "elysia";

class BudgetRouter {
  public budgetRoutes;

  constructor() {
    this.budgetRoutes = new Elysia({ prefix: "/budgets" }).derive(() => ({
      json(data: any, status = 200) {
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      },
    }));
    this.routes();
  }

  public routes() {
    this.budgetRoutes.post("/", (c: AppContext) => BudgetController.create(c), {
      beforeHandle: [verifyToken().beforeHandle],
    });

    this.budgetRoutes.get("/", (c: AppContext) => BudgetController.getAll(c), {
      beforeHandle: [verifyToken().beforeHandle],
    });

    this.budgetRoutes.get(
      "/:id",
      (c: AppContext) => BudgetController.getById(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.budgetRoutes.put(
      "/:id",
      (c: AppContext) => BudgetController.update(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.budgetRoutes.delete(
      "/:id",
      (c: AppContext) => BudgetController.deleteById(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.budgetRoutes.get(
      "/progress/all",
      (c: AppContext) => BudgetController.getBudgetProgress(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.budgetRoutes.get(
      "/progress/:id",
      (c: AppContext) => BudgetController.getBudgetProgressById(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
  }
}

export default new BudgetRouter().budgetRoutes;
