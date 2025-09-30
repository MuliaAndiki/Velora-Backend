"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GoalController_1 = require("../controllers/GoalController");
const auth_1 = require("../middleware/auth");
class GoalRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.use(auth_1.verifyToken);
        this.router.post("/", new GoalController_1.GoalController().create);
        this.router.get("/", new GoalController_1.GoalController().getAll);
        this.router.get("/:id", new GoalController_1.GoalController().getById);
        this.router.get("/:id/progress", new GoalController_1.GoalController().progress);
        this.router.put("/:id", new GoalController_1.GoalController().update);
        this.router.delete("/:id", new GoalController_1.GoalController().delete);
    }
}
exports.default = new GoalRouter().router;
