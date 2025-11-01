import Elysia from "elysia";
import GoalController from "@/controllers/GoalController";
import { AppContext } from "@/contex/app-context";
import { verifyToken } from "@/middlewares/auth";

class GoalRouter {
  public goalRouter;

  constructor() {
    this.goalRouter = new Elysia({ prefix: "/api/goals" }).derive(() => ({
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
    this.goalRouter.post("/", (c: AppContext) => GoalController.createGoal(c), {
      beforeHandle: [verifyToken().beforeHandle],
    });
    this.goalRouter.get("/", (c: AppContext) => GoalController.getGoalAll(c), {
      beforeHandle: [verifyToken().beforeHandle],
    });
    this.goalRouter.get(
      "/:id",
      (c: AppContext) => GoalController.getGoalByID(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.goalRouter.delete(
      "/",
      (c: AppContext) => GoalController.deleteGoalAll(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.goalRouter.delete(
      "/:id",
      (c: AppContext) => GoalController.deleteGoalByID(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.goalRouter.put("/:id", (c: AppContext) => GoalController.EditGoal(c), {
      beforeHandle: [verifyToken().beforeHandle],
    });
  }
}

export default new GoalRouter().goalRouter;
