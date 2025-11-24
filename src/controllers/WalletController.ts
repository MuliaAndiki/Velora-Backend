import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import { PickCreateWallet } from "@/types/wallet.types";
import prisma from "prisma/client";

class WalletController {
  public async create(c: AppContext) {
    try {
      const wall = c.body as PickCreateWallet;
      const jwtUser = c.user as JwtPayload;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }
      if (!wall.name) {
        return c.json?.(
          {
            status: 400,
            message: "body is required",
          },
          400
        );
      }
      const wallet = await prisma.wallet.create({
        data: {
          name: wall.name,
          userID: jwtUser.id,
        },
      });

      return c.json?.(
        {
          status: 201,
          message: "succes create wallet",
          data: wallet,
        },
        201
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async get(c: AppContext) {
    try {
      const jwtUser = c.user as JwtPayload;
      if (!jwtUser) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }
      const wallets = await prisma.wallet.findMany({
        where: {
          userID: jwtUser.id,
        },
      });

      return c.json?.(
        {
          status: 200,
          message: "succes get wallets",
          data: wallets,
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
}

export default new WalletController();
