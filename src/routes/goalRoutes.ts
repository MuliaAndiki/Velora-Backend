import express from "express";
import { GoalController } from "../controllers/GoalController";
import { verifyToken } from "../middleware/auth";

class GoalRouter {
  public router;

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.use(verifyToken);
    this.router.post("/", new GoalController().create);
    this.router.get("/", new GoalController().getAll);
    this.router.get("/:id", new GoalController().getById);
    this.router.get("/:id/progress", new GoalController().progress);
    this.router.put("/:id", new GoalController().update);
    this.router.delete("/:id", new GoalController().delete);
  }
}

export default new GoalRouter().router;
