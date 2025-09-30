import { Request, Response } from "express";
import { Transaction } from "../models/Transaction";

export class ReportController {
  public monthlyRecap = async (
    req: Request<{ month?: string; year?: string }>,
    res: Response
  ): Promise<void> => {
    const userId = req.user!._id; // <-- ambil user dari token
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const agg = await Transaction.aggregate([
      { $match: { userId, date: { $gte: start, $lte: end } } }, // <-- filter per user
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    const income = agg.find((a) => a._id === "income")?.total || 0;
    const expense = agg.find((a) => a._id === "expense")?.total || 0;

    res.json({
      month,
      year,
      income,
      expense,
      net: income - expense,
    });
  };

  public expenseTrend = async (
    req: Request<{ year?: string }>,
    res: Response
  ): Promise<void> => {
    const userId = req.user!._id; // <-- ambil user dari token
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const agg = await Transaction.aggregate([
      { $match: { userId, type: "expense", date: { $gte: start, $lte: end } } }, // <-- filter per user
      {
        $group: { _id: { m: { $month: "$date" } }, total: { $sum: "$amount" } },
      },
      { $sort: { "_id.m": 1 } },
    ]);

    res.json({ year, trend: agg });
  };
}

export default new ReportController();
