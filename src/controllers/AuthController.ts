import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  PickRegister,
  PickLogin,
  PickLogout,
  JwtPayload,
} from "@/types/auth.types";
import prisma from "prisma/client";
import { AppContext } from "@/contex/app-context";
import { verifyToken } from "@/middlewares/auth";

class AuthController {
  public async register(c: AppContext) {
    try {
      const auth = c.body as PickRegister;

      if (!auth.email || !auth.fullName || !auth.password) {
        return c.json?.({ message: "All fields are required" }, 400);
      }

      const isAlreadyRegistered = await prisma.user.findUnique({
        where: { email: auth.email },
      });

      if (isAlreadyRegistered) {
        return c.json?.({ message: "Email already registered" }, 400);
      }

      const hashedPassword = await bcryptjs.hash(auth.password, 10);

      const newUser = await prisma.user.create({
        data: {
          email: auth.email,
          fullName: auth.fullName,
          password: hashedPassword,
          role: auth.role || "user",
        },
      });

      return c.json?.(
        {
          status: 201,
          data: newUser,
          message: "Account successfully registered",
        },
        201
      );
    } catch (error) {
      console.error(error);
      return c.json?.(
        {
          status: 500,
          message: "Server Interval Error",
        },
        500
      );
    }
  }

  public async login(c: AppContext) {
    try {
      const auth = c.body as PickLogin;

      if (!auth.email || !auth.password) {
        return c.json?.(
          {
            status: 400,
            message: "Email & Password isRequared",
          },
          400
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: auth.email },
      });
      if (!user) {
        return c.json?.(
          {
            status: 400,
            message: "User Not Found",
          },
          400
        );
      }

      const validatePassword = await bcryptjs.compare(
        auth.password,
        user.password
      );
      if (!validatePassword) {
        return c.json?.(
          {
            status: 400,
            message: "EMail & Password Not Match",
          },
          400
        );
      }

      const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };
      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      await prisma.user.update({ where: { id: user.id }, data: { token } });

      return c.json?.(
        {
          status: 200,
          data: { ...user, token },
          message: "Login successfully",
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.({ status: 500, message: "Internal server error" }, 500);
    }
  }

  public async logout(c: AppContext) {
    try {
      const auth = c.user as JwtPayload;

      if (!auth?.id) {
        return c.json?.({ status: 401, message: "Unauthorized" }, 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: auth.id },
      });

      if (!user) {
        return c.json?.({ status: 404, message: "Account not found" }, 404);
      }

      await prisma.user.update({
        where: { id: auth.id },
        data: { token: null },
      });

      return c.json?.(
        {
          status: 200,
          message: "Account logged out successfully",
        },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json?.({ status: 500, message: "Internal server error" }, 500);
    }
  }
}

export default new AuthController();
