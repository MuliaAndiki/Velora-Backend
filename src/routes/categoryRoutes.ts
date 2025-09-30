import express from "express";
import { CategoryController } from "../controllers/CategoryController";
import { verifyToken } from "../middleware/auth";

class CategoryRouter {
  public router;

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.use(verifyToken);

    this.router.post("/", new CategoryController().create);
    this.router.get("/", new CategoryController().getAll);
    this.router.get("/:id", new CategoryController().getById);
    this.router.put("/:id", new CategoryController().update);
    this.router.delete("/:id", new CategoryController().delete);
  }
}

export default new CategoryRouter().router;
