import Elysia from "elysia";
import cors from "@elysiajs/cors";
import autnRoutes from "./routes/authRoutes";
import categoryRoutes from "./routes/categoryRoutes";

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
    this.app.use(autnRoutes);
    this.app.use(categoryRoutes);
  }
}

export default new App().app;
