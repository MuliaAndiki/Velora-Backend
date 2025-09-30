"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const Transaction_1 = require("../models/Transaction");
const export_service_1 = require("../services/export.service");
const response = __importStar(require("../utils/response"));
class TransactionController {
    /** Create a new transaction (supports receipt upload) */
    static async create(req, res) {
        try {
            const userId = req.user._id;
            const { amount, categoryId, description, date, type } = req.body;
            const receiptUrl = req.file?.path;
            const tx = await Transaction_1.Transaction.create({
                amount,
                categoryId,
                description,
                date: new Date(date),
                type,
                receiptUrl,
                userId,
            });
            response.success(res, tx, "Transaction created", 201);
        }
        catch (err) {
            response.error(res, null, err?.message || "Failed to create transaction", 500);
        }
    }
    /** Get all transactions with pagination */
    static async getAll(req, res) {
        try {
            const userId = req.user._id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const [items, totalData] = await Promise.all([
                Transaction_1.Transaction.find({ userId }).sort({ date: -1 }).skip(skip).limit(limit),
                Transaction_1.Transaction.countDocuments({ userId }),
            ]);
            const totalPages = Math.ceil(totalData / limit) || 1;
            response.paged(res, items, totalData, totalPages, "Transactions fetched", 200);
        }
        catch (err) {
            response.error(res, null, err?.message || "Failed to fetch transactions", 500);
        }
    }
    static async getById(req, res) {
        try {
            const userId = req.user._id;
            const tx = await Transaction_1.Transaction.findOne({ _id: req.params.id, userId });
            if (!tx) {
                response.error(res, [{ field: "id", message: "Transaction not found" }], "Not found", 404);
                return;
            }
            response.success(res, tx, "Transaction fetched", 200);
        }
        catch (err) {
            response.error(res, null, err?.message || "Failed to fetch transaction", 500);
        }
    }
    static async update(req, res) {
        try {
            const userId = req.user._id;
            const payload = { ...req.body };
            if (payload.date)
                payload.date = new Date(payload.date);
            const receiptUrl = req.file?.path;
            if (receiptUrl)
                payload.receiptUrl = receiptUrl;
            const tx = await Transaction_1.Transaction.findOneAndUpdate({ _id: req.params.id, userId }, payload, { new: true });
            if (!tx) {
                response.error(res, [{ field: "id", message: "Transaction not found" }], "Not found", 404);
                return;
            }
            response.success(res, tx, "Transaction updated", 200);
        }
        catch (err) {
            response.error(res, null, err?.message || "Failed to update transaction", 500);
        }
    }
    static async delete(req, res) {
        try {
            const userId = req.user._id;
            const tx = await Transaction_1.Transaction.findOneAndDelete({
                _id: req.params.id,
                userId,
            });
            if (!tx) {
                response.error(res, [{ field: "id", message: "Transaction not found" }], "Not found", 404);
                return;
            }
            response.success(res, tx, "Transaction deleted", 200);
        }
        catch (err) {
            response.error(res, null, err?.message || "Failed to delete transaction", 500);
        }
    }
    static async filter(req, res) {
        try {
            const userId = req.user._id;
            const { startDate, endDate, categoryId, minAmount, maxAmount, keyword, type, page: p, limit: l, } = req.query;
            const q = { userId };
            if (startDate || endDate)
                q.date = {};
            if (startDate)
                q.date.$gte = new Date(startDate);
            if (endDate)
                q.date.$lte = new Date(endDate);
            if (categoryId)
                q.categoryId = categoryId;
            if (type)
                q.type = type;
            if (minAmount || maxAmount)
                q.amount = {};
            if (minAmount)
                q.amount.$gte = Number(minAmount);
            if (maxAmount)
                q.amount.$lte = Number(maxAmount);
            if (keyword)
                q.description = { $regex: keyword, $options: "i" };
            const page = Number(p) || 1;
            const limit = Number(l) || 10;
            const skip = (page - 1) * limit;
            const [items, totalData] = await Promise.all([
                Transaction_1.Transaction.find(q).sort({ date: -1 }).skip(skip).limit(limit),
                Transaction_1.Transaction.countDocuments(q),
            ]);
            const totalPages = Math.ceil(totalData / limit) || 1;
            response.paged(res, items, totalData, totalPages, "Transactions filtered", 200);
        }
        catch (err) {
            response.error(res, null, err?.message || "Failed to filter transactions", 500);
        }
    }
    static async exportData(req, res) {
        try {
            const format = (req.query.format || "csv").toString();
            const result = await TransactionController._findForExport(req);
            if (format === "csv") {
                const csv = await (0, export_service_1.toCSV)(result);
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');
                res.send(csv);
                return;
            }
            if (format === "excel") {
                const buf = await (0, export_service_1.toExcel)(result, "Transactions");
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
                res.send(Buffer.from(buf));
                return;
            }
            const buf = await (0, export_service_1.toPDF)(result, "Transactions");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.pdf"');
            res.send(Buffer.from(buf));
        }
        catch (err) {
            response.error(res, null, err?.message || "Failed to export transactions", 500);
        }
    }
    static async _findForExport(req) {
        const userId = req.user.id;
        const { startDate, endDate, categoryId, minAmount, maxAmount, keyword, type, } = req.query;
        const q = { userId };
        if (startDate || endDate)
            q.date = {};
        if (startDate)
            q.date.$gte = new Date(startDate);
        if (endDate)
            q.date.$lte = new Date(endDate);
        if (categoryId)
            q.categoryId = categoryId;
        if (type)
            q.type = type;
        if (minAmount || maxAmount)
            q.amount = {};
        if (minAmount)
            q.amount.$gte = Number(minAmount);
        if (maxAmount)
            q.amount.$lte = Number(maxAmount);
        if (keyword)
            q.description = { $regex: keyword, $options: "i" };
        return Transaction_1.Transaction.find(q).sort({ date: -1 });
    }
}
exports.TransactionController = TransactionController;
exports.default = new TransactionController();
