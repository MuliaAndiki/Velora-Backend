"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const Category_1 = require("../models/Category");
const wrap_1 = require("../utils/wrap");
class CategoryController {
    constructor() {
        this.create = (0, wrap_1.warp)(async (req, res) => {
            const created = await Category_1.Category.create({
                ...req.body,
                userId: req.user._id,
            });
            res.status(201).json({
                data: created,
                message: "Category created successfully",
                code: 201,
                status: "success",
                errors: null,
            });
        });
        this.getAll = (0, wrap_1.warp)(async (req, res) => {
            const items = await Category_1.Category.find({ userId: req.user._id }).lean();
            res.json({
                data: items,
                message: "Categories fetched successfully",
                code: 200,
                status: "success",
                errors: null,
            });
        });
        this.getById = (0, wrap_1.warp)(async (req, res) => {
            const item = await Category_1.Category.findOne({
                _id: req.params.id,
                userId: req.user._id,
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
        });
        this.update = (0, wrap_1.warp)(async (req, res) => {
            const item = await Category_1.Category.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true }).lean();
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
        });
        this.delete = (0, wrap_1.warp)(async (req, res) => {
            const item = await Category_1.Category.findOneAndDelete({
                _id: req.params.id,
                userId: req.user._id,
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
        });
    }
}
exports.CategoryController = CategoryController;
