import { Document } from "mongoose";

export interface IAuth extends Document {
  _id: any;
  email: string;
  fullName: string;
  phone: string;
  password: string;
  token: string;
  photoUrl?: string | null;
  createdAt: Date;
  updateAt: Date;
  __v: any;
}

export type JwtPayload = Pick<IAuth, "_id" | "email" | "fullName" | "phone">;
export type PickRegister = Pick<IAuth, "email" | "fullName" | "password">;
export type PickLogin = Pick<IAuth, "email" | "password">;
export type PickLogout = Pick<IAuth, "_id">;

export type PickEditProfile = Pick<IAuth, "fullName" | "email" | "phone">;
export type PickGetProfile = Pick<IAuth, "_id">;
