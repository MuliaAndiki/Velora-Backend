import { Request, Response } from "express";
import { Category } from "../models/Category";
import { CreateCategoryDto, UpdateCategoryDto } from "../types/category.types";
import { warp } from "../utils/wrap";

export class CategoryController {
  public create = warp(
    async (
      req: Request<{}, CreateCategoryDto>,
      res: Response
    ): Promise<void> => {
      const created = await Category.create({
        ...req.body,
        userId: req.user!._id,
      });
      res.status(201).json({
        data: created,
        message: "Category created successfully",
        code: 201,
        status: "success",
        errors: null,
      });
    }
  );

  public getAll = warp(async (req: Request, res: Response): Promise<void> => {
    const items = await Category.find({ userId: req.user!._id }).lean();
    res.json({
      data: items,
      message: "Categories fetched successfully",
      code: 200,
      status: "success",
      errors: null,
    });
  });

  public getById = warp(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      const item = await Category.findOne({
        _id: req.params.id,
        userId: req.user!._id,
      }).lean();
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Category not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }
      res.json({
        data: item,
        message: "Category fetched successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public update = warp(
    async (
      req: Request<{ id: string }, UpdateCategoryDto>,
      res: Response
    ): Promise<void> => {
      const item = await Category.findOneAndUpdate(
        { _id: req.params.id, userId: req.user!._id },
        req.body,
        { new: true }
      ).lean();
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Category not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }
      res.json({
        data: item,
        message: "Category updated successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public delete = warp(
    async (req: Request<{ id: string }>, res: Response): Promise<void> => {
      const item = await Category.findOneAndDelete({
        _id: req.params.id,
        userId: req.user!._id,
      }).lean();
      if (!item) {
        res.status(404).json({
          data: null,
          message: "Category not found",
          code: 404,
          status: "error",
          errors: null,
        });
        return;
      }
      res.status(200).json({
        data: null,
        message: "Category deleted successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );
}
