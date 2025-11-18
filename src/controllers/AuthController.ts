import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  PickRegister,
  PickLogin,
  JwtPayload,
  PickForgotPasswordEmail,
  PickVerify,
  PickSendOtp,
  PickResetPassword,
  PickUpdateProfile,
} from "@/types/auth.types";
import prisma from "prisma/client";
import { AppContext } from "@/contex/app-context";
import { generateOtp } from "@/utils/generate-otp";
import { sendOTPEmail } from "@/utils/mailer";
import { uploadCloudinary } from "@/utils/clodinary";

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
      const otp = generateOtp(6);
      const otpExpiress = new Date(Date.now() + 5 * 60 * 1000);

      const newUser = await prisma.user.create({
        data: {
          email: auth.email,
          fullName: auth.fullName,
          password: hashedPassword,
          role: auth.role || "user",
          otp: otp,
          expOtp: otpExpiress,
          isVerify: false,
        },
      });
      newUser.expOtp = otpExpiress;
      await sendOTPEmail(auth.email, otp);
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
          error: error instanceof Error ? error.message : error,
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
      return c.json?.(
        {
          status: 500,
          message: "Internal server error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
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
      return c.json?.(
        {
          status: 500,
          message: "Internal server error",
          error: error instanceof Error ? error.message : error,
        },
        500
      );
    }
  }
  public async forgotPassword(c: AppContext) {
    try {
      const auth = c.body as PickForgotPasswordEmail;
      if (!auth.email) {
        return c.json?.(
          {
            status: 400,
            message: "Email Required",
          },
          400
        );
      }
      const user = await prisma.user.findFirst({
        where: { email: auth.email },
      });

      if (!user) {
        return c.json?.(
          {
            status: 404,
            message: "Email Not Found",
          },
          404
        );
      }
      const otp = generateOtp(6);
      const otpExpiress = new Date(Date.now() + 5 * 60 * 1000);
      await sendOTPEmail(auth.email, otp);

      const newOtp = await prisma.user.update({
        where: {
          email: auth.email,
        },
        data: {
          otp: otp,
          expOtp: otpExpiress,
        },
      });

      return c.json?.({
        status: 200,
        data: newOtp,
        message: "Succes Get Email",
      });
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
  public async verifyOtp(c: AppContext) {
    try {
      const auth = c.body as PickVerify;
      if (!auth.email || !auth.otp) {
        return c.json?.(
          {
            status: 400,
            message: "Email & Otp requaired",
          },
          400
        );
      }
      const user = await prisma.user.findFirst({
        where: {
          email: auth.email,
          otp: auth.otp,
        },
      });

      if (!user) {
        return c.json?.(
          {
            status: 404,
            message: "Email or OTP Not Found / OTP Failed",
          },
          404
        );
      }

      const updateUser = await prisma.user.update({
        where: { id: user!.id },
        data: { isVerify: true, otp: null },
      });

      return c.json?.(
        {
          status: 200,
          message: "Otp isVerify",
          data: updateUser,
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

  public async sendOtp(c: AppContext) {
    try {
      const auth = c.body as PickSendOtp;
      if (!auth.email) {
        return c.json?.(
          {
            status: 400,
            message: "Email is required",
          },
          400
        );
      }
      const user = await prisma.user.findFirstOrThrow({
        where: {
          email: auth.email,
        },
      });

      if (!user) {
        return c.json?.(
          {
            status: 404,
            message: "Account Not Found",
          },
          404
        );
      }

      const otp = generateOtp(6);
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

      const newOtp = await prisma.user.update({
        where: { id: user.id },
        data: { otp: otp, expOtp: otpExpires },
      });

      await sendOTPEmail(auth.email, otp);

      return c.json?.(
        {
          status: 200,
          message: "Succes Update Otp",
          data: newOtp,
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
  public async resetPassword(c: AppContext) {
    try {
      const auth = c.body as PickResetPassword;
      if (!auth.email || !auth.password) {
        return c.json?.(
          {
            status: 404,
            message: "Email & NewPassword required ",
          },
          404
        );
      }
      const user = await prisma.user.findFirst({
        where: {
          email: auth.email,
        },
      });
      if (!user) {
        return c.json?.(
          {
            status: 404,
            message: "Email Not Found",
          },
          404
        );
      }
      if (!user.isVerify) {
        return c.json?.(
          {
            status: 400,
            message: "accound not verify",
          },
          400
        );
      }

      const hashedPassword = await bcryptjs.hash(auth.password, 10);

      const newPassword = await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return c.json?.(
        {
          status: 200,
          message: "Succes Reset Password",
          data: newPassword,
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
  public async getProfile(c: AppContext) {
    try {
      const user = c.user as JwtPayload;

      if (!user) {
        return c.json?.(
          {
            status: 404,
            message: "user not found",
          },
          404
        );
      }
      const auth = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
      });

      return c.json?.({
        status: 200,
        message: "succes get user",
        data: auth,
      });
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
  public async editProfile(c: AppContext) {
    try {
      const user = c.body as PickUpdateProfile;
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
      let documentUrl: { photoUrl: string } = { photoUrl: "" };
      if (c.files?.photoUrl?.[0]) {
        const file = c.files.photoUrl[0];
        const buffer = file.buffer;

        const result = await uploadCloudinary(
          buffer,
          "photoUrl",
          file.originalname
        );
        documentUrl.photoUrl = result.secure_url;
      } else if (
        user.photoUrl &&
        typeof user.photoUrl === "string" &&
        user.photoUrl.startsWith("data:image")
      ) {
        const base64 = user.photoUrl;
        const buffer = Buffer.from(base64.split(",")[1], "base64");

        const result = await uploadCloudinary(buffer, "photoUrl", "image.png");
        documentUrl.photoUrl = result.secure_url;
      }
      const Auth = await prisma.user.update({
        where: {
          id: jwtUser.id,
        },
        data: {
          fullName: user.fullName,
          email: user.email,
          photoUrl: documentUrl.photoUrl,
        },
      });
      return c.json?.({
        status: 201,
        message: "succes update profile",
        data: Auth,
      });
    } catch (error) {
      console.error(error);
      return c.json?.({
        status: 500,
        message: "Server Internal Error",
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}

export default new AuthController();
