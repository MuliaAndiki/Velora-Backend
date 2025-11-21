export interface Wallet {
  id: string;
  name: string;
  balance: number;
  userID: string;
}

export type JwtWallet = Pick<Wallet, "id" | "name">;
export type PickCreateWallet = Pick<Wallet, "name">;
