import { Request, Response } from "express";
import { Goal } from "../models/Goal";
import { CreateGoalDto, UpdateGoalDto } from "../types/goal.types";
import { warp } from "../utils/wrap";

export class GoalController {
  public create = warp(
    async (req: Request<{}, CreateGoalDto>, res: Response): Promise<void> => {
      const created = await Goal.create({
        ...req.body,
        userId: req.user!._id,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      });
      res.status(201).json({
        data: created,
        message: "Goal created successfully",
        code: 201,
        status: "success",
        errors: null,
      });
    }
  );

  public getAll = warp(async (req: Request, res: Response): Promise<void> => {
    const list = await Goal.find({ userId: req.user!._id }).sort({
      createdAt: -1,
    });
    res.json({
      data: list,
      message: "Goals fetched successfully",
      code: 200,
      status: "success",
      errors: null,
    });
  });

  public getById = warp(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      const item = await Goal.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      });
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Goal not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }
      res.json({
        data: item,
        message: "Goal fetched successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public update = warp(
    async (
      req: Request<{ id: string }, UpdateGoalDto>,
      res: Response
    ): Promise<void> => {
      const payload: any = { ...req.body };
      if (payload.deadline) payload.deadline = new Date(payload.deadline);

      const item = await Goal.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id }, // <-- per user
        payload,
        { new: true }
      );
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Goal not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }

      res.json({
        data: item,
        message: "Goal updated successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public delete = warp(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      const item = await Goal.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      }); // <-- per user
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Goal not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }

      res.status(204).json({
        data: null,
        message: "Goal deleted successfully",
        code: 204,
        status: "success",
        errors: null,
      });
    }
  );

  public progress = warp(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      const item = await Goal.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      }); // <-- per user
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Goal not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }

      const ratio = item.targetAmount
        ? item.savedAmount / item.targetAmount
        : 0;
      const percent = Math.min(100, Math.round(ratio * 100));

      res.json({
        data: {
          percent,
          savedAmount: item.savedAmount,
          targetAmount: item.targetAmount,
        },
        message: "Goal progress fetched successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );
}
