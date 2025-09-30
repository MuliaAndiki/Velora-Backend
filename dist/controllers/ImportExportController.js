"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportExportController = void 0;
const Transaction_1 = require("../models/Transaction");
const export_service_1 = require("../services/export.service");
const backup_service_1 = require("../services/backup.service");
const csv_parse_1 = require("csv-parse");
const fs_1 = __importDefault(require("fs"));
const wrap_1 = require("../utils/wrap");
class ImportExportController {
    constructor() {
        this.importCSV = (0, wrap_1.warp)(async (req, res) => {
            const filePath = req.file?.path;
            if (!filePath) {
                res.status(400).json({ message: "No file uploaded" });
                return;
            }
            const rows = [];
            const parser = fs_1.default
                .createReadStream(filePath)
                .pipe((0, csv_parse_1.parse)({ columns: true, trim: true }));
            for await (const record of parser)
                rows.push(record);
            const docs = rows.map((r) => ({
                amount: Number(r.amount),
                categoryId: r.categoryId,
                description: r.description,
                date: new Date(r.date),
                type: r.type === "income" ? "income" : "expense",
            }));
            const inserted = await Transaction_1.Transaction.insertMany(docs);
            res.json({
                data: { inserted: inserted.length },
                message: "Transactions imported successfully",
                code: 200,
                status: "success",
                errors: null,
            });
        });
        this.exportAll = (0, wrap_1.warp)(async (req, res) => {
            const format = (req.query.format || "csv").toString();
            const rows = await Transaction_1.Transaction.find().lean();
            if (format === "csv") {
                const csv = await (0, export_service_1.toCSV)(rows);
                res.setHeader("Content-Type", "text/csv");
                res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');
                res.send(csv);
                return;
            }
            if (format === "excel") {
                const buf = await (0, export_service_1.toExcel)(rows, "Transactions");
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", 'attachment; filename="transactions.xlsx"');
                res.send(Buffer.from(buf));
                return;
            }
            const buf = await (0, export_service_1.toPDF)(rows, "Transactions");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", 'attachment; filename="transactions.pdf"');
            res.send(Buffer.from(buf));
        });
        this.backup = (0, wrap_1.warp)(async (req, res) => {
            const { provider, filePath } = req.body;
            if (!provider || !filePath) {
                res.status(400).json({
                    data: null,
                    message: "Provider and filePath are required",
                    code: 400,
                    status: "error",
                    errors: null,
                });
                return;
            }
            if (provider === "drive")
                await (0, backup_service_1.backupToGoogleDrive)(filePath);
            else
                await (0, backup_service_1.backupToDropbox)(filePath);
            res.json({
                data: null,
                message: "Backup completed successfully",
                code: 200,
                status: "success",
                errors: null,
            });
        });
    }
}
exports.ImportExportController = ImportExportController;
