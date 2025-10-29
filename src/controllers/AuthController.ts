import { Request, Response } from "express";
import Auth from "../models/Auth";
import {
  IAuth,
  PickLogin,
  PickRegister,
  JwtPayload,
  PickLogout,
  PickEditProfile,
  PickGetProfile,
} from "../types/auth.types";
import { verifyToken } from "../middleware/auth";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { uploadImages } from "../config/multer";
import { uploadCloudinary } from "../config/cloudinary";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

class AuthController {
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickRegister = req.body;

      if (!auth.email || !auth.fullName || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All field is required",
        });
        return;
      }

      const isAlreadyRegistered: IAuth | null = await Auth.findOne({
        email: auth.email,
      });

      if (isAlreadyRegistered) {
        res.status(400).json({
          status: 400,
          message: "This email is already registered, try another email",
        });
        return;
      }

      bcryptjs.hash(auth.password, 10, async (err, hash): Promise<void> => {
        if (err) {
          res.status(500).json(err);
          return;
        }
        const newAuth = new Auth({
          email: auth.email,
          fullName: auth.fullName,
          password: hash,
        });

        await newAuth.save();

        res.status(201).json({
          status: 200,
          data: newAuth,
          message: "account successfully registered",
        });

        return;
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
      return;
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth: PickLogin = req.body;

      if (!auth.email || !auth.password) {
        res.status(400).json({
          status: 400,
          message: "All field is required",
        });
        return;
      }

      const isAuthExist: IAuth | null = await Auth.findOne({
        email: auth.email,
      });
      if (!isAuthExist) {
        res.status(404).json({
          status: 404,
          message: "Account not found",
        });
        return;
      }

      const validateAuth = await bcryptjs.compare(
        auth.password,
        isAuthExist.password
      );

      if (!validateAuth) {
        res
          .status(400)
          .json({ status: 400, message: "Wrong email or password" });
        return;
      }

      const payload: JwtPayload = {
        _id: isAuthExist._id,
        email: isAuthExist.email,
        fullName: isAuthExist.fullName,
        phone: isAuthExist.phone,
      };

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables");
        res.status(500).json({
          status: 500,
          message: "Server configuration error.",
        });
        return;
      }
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        async (err, token): Promise<void> => {
          if (err) {
            res.status(500).json(err);
            return;
          }

          isAuthExist.set("token", token);
          await isAuthExist.save();
          res.status(200).json({
            status: 200,
            data: isAuthExist,
            message: "Login successfully",
          });

          return;
        }
      );
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
      });
      return;
    }
  };

  public getProfileByUser = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { _id }: PickGetProfile = req.user as JwtPayload;

        const auth: IAuth | null = await Auth.findById(_id);

        if (!auth) {
          res.status(400).json({
            status: 400,
            message: "Account not found",
          });
          return;
        }

        res.status(200).json({
          status: 200,
          message: "User Profile Found",
          data: auth,
        });
        return;
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
        return;
      }
    },
  ];
  public logout = [
    verifyToken,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { _id }: PickLogout = req.user as JwtPayload;

        const auth: IAuth | null = await Auth.findById(_id);

        if (!auth) {
          res.status(404).json({
            status: 404,
            message: "Account not found",
          });
          return;
        }

        auth.set("token", null);
        await auth.save();

        res.status(200).json({
          status: 2000,
          message: "Account logut successfully",
        });

        return;
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Internal server error",
        });
        return;
      }
    },
  ];
  public editProfile = [
    verifyToken,
    uploadImages,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const auth: PickEditProfile = req.body;
        const user = (req as any).user;

        if (!user?._id) {
          res.status(401).json({
            status: 401,
            message: "Unauthorized",
          });
        }

        const files = req.files as
          | Record<string, Express.Multer.File[]>
          | undefined;
        const foto = files?.fotoProfile?.[0];
        let fotoUrl: string | undefined;

        if (foto) {
          const result = await uploadCloudinary(
            foto.buffer,
            "fotoProfile",
            foto.originalname
          );
          fotoUrl = result.secure_url;
        }

        const updateData: Partial<PickEditProfile & { fotoProfile?: string }> =
          {
            ...(auth.fullName && { fullName: auth.fullName }),
            ...(auth.email && { email: auth.email }),

            ...(fotoUrl && { fotoProfile: fotoUrl }),
          };

        if (Object.keys(updateData).length === 0) {
          res.status(400).json({
            status: 400,
            message: "Nothing to update",
          });
        }

        await Auth.findByIdAndUpdate(user._id, { $set: updateData });

        res.status(200).json({
          status: 200,
          message: "Profile updated successfully",
          data: updateData,
        });
      } catch (error) {
        res.status(500).json({
          status: 500,
          message: "Server Internal Error",
          error: error instanceof Error ? error.message : error,
        });
      }
    },
  ];
}

export default new AuthController();
