import { AppContext } from "@/contex/app-context";
import FinancialReportController from "@/controllers/FinancialReportController";
import { verifyToken } from "@/middlewares/auth";
import Elysia from "elysia";

class FinancialReportRouter {
  public reportRoutes;

  constructor() {
    this.reportRoutes = new Elysia({ prefix: "/reports" }).derive(() => ({
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
    this.reportRoutes.post(
      "/",
      (c: AppContext) => FinancialReportController.create(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.reportRoutes.get(
      "/",
      (c: AppContext) => FinancialReportController.getAll(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.reportRoutes.get(
      "/summary",
      (c: AppContext) => FinancialReportController.getSummary(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.reportRoutes.get(
      "/:id",
      (c: AppContext) => FinancialReportController.getById(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );

    this.reportRoutes.delete(
      "/:id",
      (c: AppContext) => FinancialReportController.deleteById(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
  }
}

export default new FinancialReportRouter().reportRoutes;
