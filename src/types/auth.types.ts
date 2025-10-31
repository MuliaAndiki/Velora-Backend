export interface Auth {
  id: string;
  email: string;
  fullName: string;
  password: string;
  token?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  otp?: string;
  expOtp?: Date;
  photoUrl?: string;
  isVerify?: boolean;
}

export type JwtPayload = Pick<Auth, "id" | "email" | "role" | "fullName">;
export type PickRegister = Pick<
  Auth,
  "email" | "fullName" | "password" | "role"
>;
export type PickLogin = Pick<Auth, "email" | "password">;
export type PickLogout = Pick<Auth, "id">;
export type PickForgotPasswordEmail = Pick<Auth, "email">;
export type PickVerify = Pick<Auth, "email" | "otp">;
export type PickSendOtp = Pick<Auth, "email">;
export type PickResetPassword = Pick<Auth, "email" | "password">;
