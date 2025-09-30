import { Request, Response } from "express";
import { Transaction, ITransaction } from "../models/Transaction";
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionDto,
} from "../types/transaction.types";
import { toCSV, toExcel, toPDF } from "../services/export.service";
import * as response from "../utils/response";

export class TransactionController {
  /** Create a new transaction (supports receipt upload) */
  static async create(
    req: Request<{}, {}, CreateTransactionDto>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const { amount, categoryId, description, date, type } = req.body;
      const receiptUrl = (req as any).file?.path;
      const tx = await Transaction.create({
        amount,
        categoryId,
        description,
        date: new Date(date),
        type,
        receiptUrl,
        userId,
      });
      response.success(res, tx, "Transaction created", 201);
    } catch (err: any) {
      response.error(
        res,
        null,
        err?.message || "Failed to create transaction",
        500
      );
    }
  }

  /** Get all transactions with pagination */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!._id;
      const page = Number((req.query as any).page) || 1;
      const limit = Number((req.query as any).limit) || 10;
      const skip = (page - 1) * limit;

      const [items, totalData] = await Promise.all([
        Transaction.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit),
        Transaction.countDocuments({ userId }),
      ]);
      const totalPages = Math.ceil(totalData / limit) || 1;

      response.paged(
        res,
        items,
        totalData,
        totalPages,
        "Transactions fetched",
        200
      );
    } catch (err: any) {
      response.error(
        res,
        null,
        err?.message || "Failed to fetch transactions",
        500
      );
    }
  }

  static async getById(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const tx = await Transaction.findOne({ _id: req.params.id, userId });
      if (!tx) {
        response.error(
          res,
          [{ field: "id", message: "Transaction not found" }],
          "Not found",
          404
        );
        return;
      }
      response.success(res, tx, "Transaction fetched", 200);
    } catch (err: any) {
      response.error(
        res,
        null,
        err?.message || "Failed to fetch transaction",
        500
      );
    }
  }

  static async update(
    req: Request<{ id: string }, {}, UpdateTransactionDto>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const payload: any = { ...req.body };
      if (payload.date) payload.date = new Date(payload.date);
      const receiptUrl = (req as any).file?.path;
      if (receiptUrl) payload.receiptUrl = receiptUrl;

      const tx = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId },
        payload,
        { new: true }
      );

      if (!tx) {
        response.error(
          res,
          [{ field: "id", message: "Transaction not found" }],
          "Not found",
          404
        );
        return;
      }
      response.success(res, tx, "Transaction updated", 200);
    } catch (err: any) {
      response.error(
        res,
        null,
        err?.message || "Failed to update transaction",
        500
      );
    }
  }

  static async delete(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const tx = await Transaction.findOneAndDelete({
        _id: req.params.id,
        userId,
      });
      if (!tx) {
        response.error(
          res,
          [{ field: "id", message: "Transaction not found" }],
          "Not found",
          404
        );
        return;
      }
      response.success(res, tx, "Transaction deleted", 200);
    } catch (err: any) {
      response.error(
        res,
        null,
        err?.message || "Failed to delete transaction",
        500
      );
    }
  }

  static async filter(
    req: Request<
      {},
      {},
      {},
      FilterTransactionDto & { page?: string; limit?: string }
    >,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user!._id;
      const {
        startDate,
        endDate,
        categoryId,
        minAmount,
        maxAmount,
        keyword,
        type,
        page: p,
        limit: l,
      } = req.query;

      const q: any = { userId };
      if (startDate || endDate) q.date = {};
      if (startDate) q.date.$gte = new Date(startDate);
      if (endDate) q.date.$lte = new Date(endDate);
      if (categoryId) q.categoryId = categoryId;
      if (type) q.type = type;
      if (minAmount || maxAmount) q.amount = {};
      if (minAmount) q.amount.$gte = Number(minAmount);
      if (maxAmount) q.amount.$lte = Number(maxAmount);
      if (keyword) q.description = { $regex: keyword, $options: "i" };

      const page = Number(p) || 1;
      const limit = Number(l) || 10;
      const skip = (page - 1) * limit;

      const [items, totalData] = await Promise.all([
        Transaction.find(q).sort({ date: -1 }).skip(skip).limit(limit),
        Transaction.countDocuments(q),
      ]);
      const totalPages = Math.ceil(totalData / limit) || 1;

      response.paged(
        res,
        items,
        totalData,
        totalPages,
        "Transactions filtered",
        200
      );
    } catch (err: any) {
      response.error(
        res,
        null,
        err?.message || "Failed to filter transactions",
        500
      );
    }
  }

  static async exportData(
    req: Request<{}, {}, {}, FilterTransactionDto & { format?: string }>,
    res: Response
  ): Promise<void> {
    try {
      const format = (req.query.format || "csv").toString();
      const result = await TransactionController._findForExport(req);

      if (format === "csv") {
        const csv = await toCSV(result);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="transactions.csv"'
        );
        res.send(csv);
        return;
      }

      if (format === "excel") {
        const buf = await toExcel(result, "Transactions");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="transactions.xlsx"'
        );
        res.send(Buffer.from(buf));
        return;
      }

      const buf = await toPDF(result, "Transactions");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="transactions.pdf"'
      );
      res.send(Buffer.from(buf));
    } catch (err: any) {
      response.error(
        res,
        null,
        err?.message || "Failed to export transactions",
        500
      );
    }
  }

  private static async _findForExport(req: any): Promise<ITransaction[]> {
    const userId = req.user!.id;
    const {
      startDate,
      endDate,
      categoryId,
      minAmount,
      maxAmount,
      keyword,
      type,
    } = req.query;

    const q: any = { userId };
    if (startDate || endDate) q.date = {};
    if (startDate) q.date.$gte = new Date(startDate);
    if (endDate) q.date.$lte = new Date(endDate);
    if (categoryId) q.categoryId = categoryId;
    if (type) q.type = type;
    if (minAmount || maxAmount) q.amount = {};
    if (minAmount) q.amount.$gte = Number(minAmount);
    if (maxAmount) q.amount.$lte = Number(maxAmount);
    if (keyword) q.description = { $regex: keyword, $options: "i" };

    return Transaction.find(q).sort({ date: -1 });
  }
}

export default new TransactionController();
