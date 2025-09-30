"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BudgetController_1 = require("../controllers/BudgetController");
const auth_1 = require("../middleware/auth");
class BudgetRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.use(auth_1.verifyToken);
        this.router.post("/", new BudgetController_1.BudgetController().create);
        this.router.get("/", new BudgetController_1.BudgetController().getAll);
        this.router.get("/progress", new BudgetController_1.BudgetController().progress);
        this.router.get("/near-limit", new BudgetController_1.BudgetController().nearLimit);
        this.router.get("/:id", new BudgetController_1.BudgetController().getById);
        this.router.put("/:id", new BudgetController_1.BudgetController().update);
        this.router.delete("/:id", new BudgetController_1.BudgetController().delete);
    }
}
exports.default = new BudgetRouter().router;
