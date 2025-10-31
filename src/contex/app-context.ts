import type { Context } from "elysia";
import type { JwtPayload } from "@/types/auth.types";

export interface AppContext extends Context {
  user?: JwtPayload;
  json?: (data: any, status?: number) => Response;
}

export type ElysiaHandler = (
  c: AppContext
) => Promise<Response | void> | Response | void;
export type ElysiaMiddleware = (
  c: AppContext
) => Promise<void | Response> | void | Response;
