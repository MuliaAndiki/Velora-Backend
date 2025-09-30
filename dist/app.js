"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const AuthRouter_1 = __importDefault(require("./routes/AuthRouter"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const importExportRoutes_1 = __importDefault(require("./routes/importExportRoutes"));
const error_1 = require("./middleware/error");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.middlewares();
        this.routes();
    }
    middlewares() {
        this.app.use((0, cors_1.default)({ origin: "*", optionsSuccessStatus: 200 }));
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(body_parser_1.default.json());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
        this.app.use("/api/auth", AuthRouter_1.default);
        this.app.use("/api/categories", categoryRoutes_1.default);
        this.app.use("/api/transactions", transactionRoutes_1.default);
        this.app.use("/api/budgets", budgetRoutes_1.default);
        this.app.use("/api/goals", goalRoutes_1.default);
        this.app.use("/api/dashboard", dashboardRoutes_1.default);
        this.app.use("/api/reports", reportRoutes_1.default);
        this.app.use("/api/io", importExportRoutes_1.default);
    }
    routes() {
        this.app.get("/", (req, res) => {
            res.json({
                message: "Hello World with TypeScript!",
                timestamp: new Date().toISOString(),
            });
        });
        this.app.use(error_1.errorHandler);
    }
    handleErrors() {
        // harus paling terakhir
        this.app.use(error_1.errorHandler);
    }
}
exports.default = new App().app;
