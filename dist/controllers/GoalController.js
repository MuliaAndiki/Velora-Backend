"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const Goal_1 = require("../models/Goal");
const wrap_1 = require("../utils/wrap");
class GoalController {
    constructor() {
        this.create = (0, wrap_1.warp)(async (req, res) => {
            const created = await Goal_1.Goal.create({
                ...req.body,
                userId: req.user._id,
                deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
            });
            res.status(201).json({
                data: created,
                message: "Goal created successfully",
                code: 201,
                status: "success",
                errors: null,
            });
        });
        this.getAll = (0, wrap_1.warp)(async (req, res) => {
            const list = await Goal_1.Goal.find({ userId: req.user._id }).sort({
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
        this.getById = (0, wrap_1.warp)(async (req, res) => {
            const item = await Goal_1.Goal.findOne({
                _id: req.params.id,
                userId: req.user._id,
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
        });
        this.update = (0, wrap_1.warp)(async (req, res) => {
            const payload = { ...req.body };
            if (payload.deadline)
                payload.deadline = new Date(payload.deadline);
            const item = await Goal_1.Goal.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, // <-- per user
            payload, { new: true });
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
        });
        this.delete = (0, wrap_1.warp)(async (req, res) => {
            const item = await Goal_1.Goal.findOneAndDelete({
                _id: req.params.id,
                userId: req.user._id,
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
        });
        this.progress = (0, wrap_1.warp)(async (req, res) => {
            const item = await Goal_1.Goal.findOne({
                _id: req.params.id,
                userId: req.user._id,
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
        });
    }
}
exports.GoalController = GoalController;
