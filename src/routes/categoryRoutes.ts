import { AppContext } from "@/contex/app-context";
import CategoryController from "@/controllers/CategoryController";
import { verifyToken } from "@/middlewares/auth";
import Elysia from "elysia";

class CategoryRouter {
  public categoryRouter;

  constructor() {
    this.categoryRouter = new Elysia({ prefix: "/api/category" }).derive(
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
    this.categoryRouter.post(
      "/",
      (c: AppContext) => CategoryController.create(c),
      { beforeHandle: [verifyToken().beforeHandle] }
    );
    this.categoryRouter.get(
      "/",
      (c: AppContext) => CategoryController.getCategory(c),
      { beforeHandle: [verifyToken().beforeHandle] }
    );
    this.categoryRouter.get(
      "/:id",
      (c: AppContext) => CategoryController.getCategoryByID(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.categoryRouter.delete(
      "/:id",
      (c: AppContext) => CategoryController.deleteCategoryByID(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.categoryRouter.delete(
      "/",
      (c: AppContext) => CategoryController.deleteCategoryAll(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
    this.categoryRouter.put(
      "/:id",
      (c: AppContext) => CategoryController.EditCategoryById(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
  }
}
export default new CategoryRouter().categoryRouter;
