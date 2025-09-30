import express from "express";
import { DashboardController } from "../controllers/DashboardController";
import { verifyToken } from "../middleware/auth";

class DashboardRouter {
  public router;

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.use(verifyToken);
    this.router.get("/summary", new DashboardController().summary);
    this.router.get("/monthly-charts", new DashboardController().monthlyCharts);
  }
}

export default new DashboardRouter().router;
