"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetController = void 0;
const Budget_1 = require("../models/Budget");
const Transaction_1 = require("../models/Transaction");
const wrap_1 = require("../utils/wrap");
class BudgetController {
    constructor() {
        this.create = (0, wrap_1.warp)(async (req, res) => {
            const created = await Budget_1.Budget.create({
                ...req.body,
                userId: req.user._id,
            });
            res.status(201).json({
                data: created,
                message: "Budget created successfully",
                code: 201,
                status: "success",
                errors: null,
            });
        });
        this.getAll = (0, wrap_1.warp)(async (req, res) => {
            const items = await Budget_1.Budget.find({ userId: req.user._id }).populate("categoryId");
            res.json({
                data: items,
                message: "Budgets fetched successfully",
                code: 200,
                status: "success",
                errors: null,
            });
        });
        this.getById = (0, wrap_1.warp)(async (req, res) => {
            const item = await Budget_1.Budget.findOne({
                _id: req.params.id,
                userId: req.user._id,
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
        });
        this.update = (0, wrap_1.warp)(async (req, res) => {
            const item = await Budget_1.Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
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
        });
        this.delete = (0, wrap_1.warp)(async (req, res) => {
            const item = await Budget_1.Budget.findOneAndDelete({
                _id: req.params.id,
                userId: req.user._id,
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
        });
        this.progress = (0, wrap_1.warp)(async (req, res) => {
            const { categoryId, month, year } = req.query;
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
            const budget = await Budget_1.Budget.findOne({
                categoryId,
                month: monthNum,
                year: yearNum,
                userId: req.user._id,
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
            const percent = Math.min(100, Math.round((budget.used / budget.amount) * 100));
            res.json({
                data: { percent, used: budget.used, amount: budget.amount },
                message: "Budget progress calculated",
                code: 200,
                status: "success",
                errors: null,
            });
        });
        this.nearLimit = (0, wrap_1.warp)(async (req, res) => {
            const { categoryId, month, year } = req.query;
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
            const budget = await Budget_1.Budget.findOne({
                categoryId,
                month: monthNum,
                year: yearNum,
                userId: req.user._id,
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
        });
        this.recalcUsed = async (categoryId, month, year) => {
            const userId = Budget_1.Budget.currentUserId;
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59, 999);
            const spentAgg = await Transaction_1.Transaction.aggregate([
                {
                    $match: {
                        categoryId: Budget_1.Budget.db.Types.ObjectId(categoryId),
                        userId: Budget_1.Budget.db.Types.ObjectId(userId),
                        type: "expense",
                        date: { $gte: start, $lte: end },
                    },
                },
                { $group: { _id: null, total: { $sum: "$amount" } } },
            ]);
            const used = spentAgg[0]?.total || 0;
            await Budget_1.Budget.findOneAndUpdate({ userId, categoryId, month, year }, { used });
        };
    }
}
exports.BudgetController = BudgetController;
