import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import authRouter from "./routes/AuthRouter";
import categoryRouter from "./routes/categoryRoutes";
import transactionRouter from "./routes/transactionRoutes";
import budgetRouter from "./routes/budgetRoutes";
import goalRouter from "./routes/goalRoutes";
import dashboardRouter from "./routes/dashboardRoutes";
import reportRouter from "./routes/reportRoutes";
import importExportRouter from "./routes/importExportRoutes";
import { errorHandler } from "./middleware/error";

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(express.json());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "uploads"))
    );

    this.app.use("/api/auth", authRouter);

    this.app.use("/api/categories", categoryRouter);
    this.app.use("/api/transactions", transactionRouter);
    this.app.use("/api/budgets", budgetRouter);
    this.app.use("/api/goals", goalRouter);
    this.app.use("/api/dashboard", dashboardRouter);
    this.app.use("/api/reports", reportRouter);
    this.app.use("/api/io", importExportRouter);
  }

  private routes(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.json({
        message: "Hello World with TypeScript!",
        timestamp: new Date().toISOString(),
      });
    });

    this.app.use(errorHandler);
  }
  private handleErrors(): void {
    // harus paling terakhir
    this.app.use(errorHandler);
  }
}

export default new App().app;
