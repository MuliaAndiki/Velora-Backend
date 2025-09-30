import { Request, Response } from "express";
import { Budget } from "../models/Budget";
import { Transaction } from "../models/Transaction";
import { CreateBudgetDto, UpdateBudgetDto } from "../types/budget.types";
import { warp } from "../utils/wrap";

export class BudgetController {
  public create = warp(
    async (req: Request<{}, CreateBudgetDto>, res: Response): Promise<void> => {
      const created = await Budget.create({
        ...req.body,
        userId: req.user!._id,
      });
      res.status(201).json({
        data: created,
        message: "Budget created successfully",
        code: 201,
        status: "success",
        errors: null,
      });
    }
  );

  public getAll = warp(async (req: Request, res: Response): Promise<void> => {
    const items = await Budget.find({ userId: req.user!._id }).populate(
      "categoryId"
    );
    res.json({
      data: items,
      message: "Budgets fetched successfully",
      code: 200,
      status: "success",
      errors: null,
    });
  });

  public getById = warp(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      const item = await Budget.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      }).populate("categoryId");
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Budget not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }
      res.json({
        data: item,
        message: "Budget fetched successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public update = warp(
    async (
      req: Request<{ id: string }, UpdateBudgetDto>,
      res: Response
    ): Promise<void> => {
      const item = await Budget.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        req.body,
        { new: true }
      );
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Budget not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }
      res.json({
        data: item,
        message: "Budget updated successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public delete = warp(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      const item = await Budget.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      });
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Budget not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }
      res.status(204).json({
        data: null,
        message: "Budget deleted successfully",
        code: 204,
        status: "success",
        errors: null,
      });
    }
  );

  public progress = warp(async (req: Request, res: Response): Promise<void> => {
    const { categoryId, month, year } = req.query as any;

    const monthNum = Number(month);
    const yearNum = Number(year);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      res.status(400).json({
        data: null,
        message: "Invalid month",
        code: 400,
        status: "error",
        errors: null,
      });
      return;
    }
    if (isNaN(yearNum) || yearNum < 1900) {
      res.status(400).json({
        data: null,
        message: "Invalid year",
        code: 400,
        status: "error",
        errors: null,
      });
      return;
    }

    const budget = await Budget.findOne({
      categoryId,
      month: monthNum,
      year: yearNum,
      userId: req.user!._id,
    });

    if (!budget) {
      res.status(404).json({
        data: null,
        message: "Budget not found for period",
        code: 404,
        status: "error",
        errors: null,
      });
      return;
    }

    const percent = Math.min(
      100,
      Math.round((budget.used / budget.amount) * 100)
    );

    res.json({
      data: { percent, used: budget.used, amount: budget.amount },
      message: "Budget progress calculated",
      code: 200,
      status: "success",
      errors: null,
    });
  });

  public nearLimit = warp(
    async (req: Request, res: Response): Promise<void> => {
      const { categoryId, month, year } = req.query as any;

      const monthNum = Number(month);
      const yearNum = Number(year);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        res.status(400).json({
          data: null,
          message: "Invalid month",
          code: 400,
          status: "error",
          errors: null,
        });
        return;
      }
      if (isNaN(yearNum) || yearNum < 1900) {
        res.status(400).json({
          data: null,
          message: "Invalid year",
          code: 400,
          status: "error",
          errors: null,
        });
        return;
      }

      const budget = await Budget.findOne({
        categoryId,
        month: monthNum,
        year: yearNum,
        userId: req.user!._id,
      });

      if (!budget) {
        res.json({
          data: { nearLimit: false, ratio: 0 },
          message: "Budget not found for period",
          code: 200,
          status: "success",
          errors: null,
        });
        return;
      }

      const ratio = budget.amount ? budget.used / budget.amount : 0;

      res.json({
        data: { nearLimit: ratio >= 0.8, ratio },
        message: "Budget limit check completed",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public recalcUsed = async (
    categoryId: string,
    month: number,
    year: number
  ): Promise<void> => {
    const userId = (Budget as any).currentUserId;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const spentAgg = await Transaction.aggregate([
      {
        $match: {
          categoryId: (Budget as any).db.Types.ObjectId(categoryId),
          userId: (Budget as any).db.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const used = spentAgg[0]?.total || 0;
    await Budget.findOneAndUpdate(
      { userId, categoryId, month, year },
      { used }
    );
  };
}
