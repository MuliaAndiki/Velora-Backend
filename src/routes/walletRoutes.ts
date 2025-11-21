import { AppContext } from "@/contex/app-context";
import WalletController from "@/controllers/WalletController";
import { verifyToken } from "@/middlewares/auth";
import Elysia from "elysia";

class WalletRouter {
  public walletRoutes;
  constructor() {
    this.walletRoutes = new Elysia({ prefix: "/wallet" }).derive(() => ({
      json(data: any, status = 200) {
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json" },
        });
      },
    }));
    this.routes();
  }

  public routes() {
    this.walletRoutes.post("/", (c: AppContext) => WalletController.create(c), {
      beforeHandle: [verifyToken().beforeHandle],
    });
    this.walletRoutes.get("/", (c: AppContext) => WalletController.get(c), {
      beforeHandle: [verifyToken().beforeHandle],
    });
  }
}

export default new WalletRouter().walletRoutes;
