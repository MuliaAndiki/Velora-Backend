"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ReportController_1 = require("../controllers/ReportController");
const auth_1 = require("../middleware/auth");
class ReportRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.use(auth_1.verifyToken);
        this.router.get("/monthly-recap", new ReportController_1.ReportController().monthlyRecap);
        this.router.get("/expense-trend", new ReportController_1.ReportController().expenseTrend);
    }
}
exports.default = new ReportRouter().router;
