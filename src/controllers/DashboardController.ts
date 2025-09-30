import { Request, Response } from "express";
import { Transaction } from "../models/Transaction";
import { warp } from "../utils/wrap";

export class DashboardController {
  public summary = warp(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id;

    const agg = await Transaction.aggregate([
      { $match: { userId: userId } }, // filter per user
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const income = agg.find((a) => a._id === "income")?.total || 0;
    const expense = agg.find((a) => a._id === "expense")?.total || 0;
    const net = income - expense;

    res.json({
      data: { income, expense, net },
      message: "Dashboard summary fetched successfully",
      code: 200,
      status: "success",
      errors: null,
    });
  });

  // Charts per month: pie (by category) & bar (by month & type)
  public monthlyCharts = warp(
    async (
      req: Request<{}, {}, { year?: string }>,
      res: Response
    ): Promise<void> => {
      const userId = req.user!._id;
      const year = Number(req.query.year) || new Date().getFullYear();
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);

      // Pie chart: expenses per category
      const pieByCategory = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            type: "expense",
            date: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
      ]);

      // Bar chart: monthly totals per type
      const barByMonth = await Transaction.aggregate([
        {
          $match: {
            userId: userId,
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { m: { $month: "$date" }, t: "$type" },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.m": 1 } },
      ]);

      res.json({
        data: { pieByCategory, barByMonth },
        message: "Dashboard monthly charts fetched successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );
}
