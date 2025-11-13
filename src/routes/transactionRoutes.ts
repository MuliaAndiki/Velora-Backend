import Elysia from "elysia";
import TransactionController from "@/controllers/TransactionController";
import { AppContext } from "@/contex/app-context";
import { verifyToken } from "@/middlewares/auth";

class TransactionRoutes {
  public transactionRouter;
  constructor() {
    this.transactionRouter = new Elysia({ prefix: "/transaction" }).derive(
      () => ({
        json(data: any, status = 200) {
          return new Response(JSON.stringify(data), {
            status,
            headers: { "Content-Type": "application/json" },
          });
        },
      })
    );
    this.routes();
  }
  private routes() {
    this.transactionRouter.post(
      "/:categoryID",
      (c: AppContext) => TransactionController.create(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
  }
}

export default new TransactionRoutes().transactionRouter;
