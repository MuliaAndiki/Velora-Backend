import Elysia from "elysia";
import cors from "@elysiajs/cors";
import autnRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import goalRoutes from "./routes/goalRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import walletRoutes from "./routes/walletRoutes";

class App {
  public app: Elysia;

  constructor() {
    this.app = new Elysia();
    this.middlewares();
    this.routes();
  }
  private routes(): void {
    this.app.get("/", () => "Hello Elysia! Bun js");
  }
  private middlewares() {
    this.app.use(cors({ origin: "*" }));
    this.app.group("/api", (api) =>
      api
        .use(autnRoutes)
        .use(categoryRoutes)
        .use(goalRoutes)
        .use(transactionRoutes)
        .use(walletRoutes)
    );
  }
}

export default new App().app;
