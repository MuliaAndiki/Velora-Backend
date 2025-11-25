import { AppContext } from "@/contex/app-context";
import { JwtPayload } from "@/types/auth.types";
import { PickCreateReport, PickGetID } from "@/types/report.types";
import prisma from "prisma/client";

class FinancialReportController {
  public async create(c: AppContext) {
    try {
      const report = c.body as PickCreateReport;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User not found" }, 404);
      }

      if (
        !report.title ||
        !report.type ||
        !report.startDate ||
        !report.endDate
      ) {
        return c.json?.(
          {
            status: 400,
            message: "Title, type, startDate, and endDate are required",
          },
          400
        );
      }

      const user = await prisma.user.findUnique({ where: { id: jwtUser.id } });
      if (!user) {
        return c.json?.({ status: 404, message: "User not found" }, 404);
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          userID: jwtUser.id,
          createdAt: {
            gte: new Date(report.startDate),
            lte: new Date(report.endDate),
          },
        },
      });

      const totalIncome = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      const newReport = await prisma.financialReport.create({
        data: {
          title: report.title,
          type: report.type,
          startDate: new Date(report.startDate),
          endDate: new Date(report.endDate),
          totalIncome,
          totalExpense,
          netAmount: totalIncome - totalExpense,
          format: report.format || "pdf",
          userID: jwtUser.id,
        },
      });

      return c.json?.(
        { status: 201, message: "Success create report", data: newReport },
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

  public async getAll(c: AppContext) {
    try {
      const user = c.user as JwtPayload;
      if (!user) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      const reports = await prisma.financialReport.findMany({
        where: { userID: user.id },
        orderBy: { createdAt: "desc" },
      });

      return c.json?.(
        {
          status: 200,
          message: "Success get all reports",
          data: reports,
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

  public async getById(c: AppContext) {
    try {
      const { id } = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      if (!id) {
        return c.json?.({ status: 400, message: "ID is required" }, 400);
      }

      const report = await prisma.financialReport.findUnique({
        where: { id, userID: jwtUser.id },
      });

      if (!report) {
        return c.json?.({ status: 404, message: "Report not found" }, 404);
      }

      return c.json?.(
        {
          status: 200,
          message: "Success get report",
          data: report,
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

  public async deleteById(c: AppContext) {
    try {
      const { id } = c.params as PickGetID;
      const jwtUser = c.user as JwtPayload;

      if (!jwtUser) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      if (!id) {
        return c.json?.({ status: 400, message: "ID is required" }, 400);
      }

      const report = await prisma.financialReport.delete({
        where: { id, userID: jwtUser.id },
      });

      return c.json?.(
        {
          status: 200,
          message: "Success delete report",
          data: report,
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

  public async getSummary(c: AppContext) {
    try {
      const user = c.user as JwtPayload;
      if (!user) {
        return c.json?.({ status: 404, message: "User Not Found" }, 404);
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const transactions = await prisma.transaction.findMany({
        where: {
          userID: user.id,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const totalIncome = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      return c.json?.(
        {
          status: 200,
          message: "Success get summary",
          data: {
            totalIncome,
            totalExpense,
            netAmount: totalIncome - totalExpense,
            period: "current_month",
          },
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

export default new FinancialReportController();
