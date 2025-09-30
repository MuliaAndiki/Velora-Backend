import express from "express";
import { ReportController } from "../controllers/ReportController";
import { verifyToken } from "../middleware/auth";

class ReportRouter {
  public router;

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.use(verifyToken);
    this.router.get("/monthly-recap", new ReportController().monthlyRecap);
    this.router.get("/expense-trend", new ReportController().expenseTrend);
  }
}

export default new ReportRouter().router;
