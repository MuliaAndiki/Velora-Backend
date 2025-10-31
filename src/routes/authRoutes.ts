import Elysia from "elysia";
import AuthController from "@/controllers/AuthController";
import { AppContext } from "@/contex/app-context";
import { verifyToken } from "@/middlewares/auth";

class AuthRouter {
  public authRouter;

  constructor() {
    this.authRouter = new Elysia({ prefix: "/api/auth" }).derive(() => ({
      json(data: any, status = 200) {
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      },
    }));
    this.routes();
  }

  private routes() {
    this.authRouter.post("/login", (c: AppContext) => AuthController.login(c));
    this.authRouter.post("/register", (c: AppContext) =>
      AuthController.register(c)
    );
    this.authRouter.post(
      "/logout",
      (c: AppContext) => AuthController.logout(c),
      {
        beforeHandle: [verifyToken().beforeHandle],
      }
    );
  }
}

export default new AuthRouter().authRouter;
