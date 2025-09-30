import express from "express";
import { BudgetController } from "../controllers/BudgetController";
import { verifyToken } from "../middleware/auth";

class BudgetRouter {
  public router;
  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.use(verifyToken);

    this.router.post("/", new BudgetController().create);
    this.router.get("/", new BudgetController().getAll);
    this.router.get("/progress", new BudgetController().progress);
    this.router.get("/near-limit", new BudgetController().nearLimit);
    this.router.get("/:id", new BudgetController().getById);
    this.router.put("/:id", new BudgetController().update);
    this.router.delete("/:id", new BudgetController().delete);
  }
}

export default new BudgetRouter().router;
