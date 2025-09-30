"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DashboardController_1 = require("../controllers/DashboardController");
const auth_1 = require("../middleware/auth");
class DashboardRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.use(auth_1.verifyToken);
        this.router.get("/summary", new DashboardController_1.DashboardController().summary);
        this.router.get("/monthly-charts", new DashboardController_1.DashboardController().monthlyCharts);
    }
}
exports.default = new DashboardRouter().router;
