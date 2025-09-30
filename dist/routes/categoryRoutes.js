"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoryController_1 = require("../controllers/CategoryController");
const auth_1 = require("../middleware/auth");
class CategoryRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.use(auth_1.verifyToken);
        this.router.post("/", new CategoryController_1.CategoryController().create);
        this.router.get("/", new CategoryController_1.CategoryController().getAll);
        this.router.get("/:id", new CategoryController_1.CategoryController().getById);
        this.router.put("/:id", new CategoryController_1.CategoryController().update);
        this.router.delete("/:id", new CategoryController_1.CategoryController().delete);
    }
}
exports.default = new CategoryRouter().router;
