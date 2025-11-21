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
    this.transactionRouter.get(
      "/",
      (c: AppContext) => TransactionController.getByUser(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.transactionRouter.get(
      "/:id",
      (c: AppContext) => TransactionController.getByID(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.transactionRouter.delete(
      "/",
      (c: AppContext) => TransactionController.deleteAll(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.transactionRouter.delete(
      "/:id",
      (c: AppContext) => TransactionController.deleteById(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.transactionRouter.put(
      "/:id",
      (c: AppContext) => TransactionController.update(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
  }
}

export default new TransactionRoutes().transactionRouter;
