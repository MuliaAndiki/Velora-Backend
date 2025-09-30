"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TransactionController_1 = require("../controllers/TransactionController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
class TransactionRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.use(auth_1.verifyToken);
        this.router.post("/", upload_1.upload.single("receipt"), TransactionController_1.TransactionController.create);
        this.router.get("/", TransactionController_1.TransactionController.getAll);
        this.router.get("/filter", TransactionController_1.TransactionController.filter);
        this.router.get("/export", TransactionController_1.TransactionController.exportData);
        this.router.get("/:id", TransactionController_1.TransactionController.getById);
        this.router.put("/:id", upload_1.upload.single("receipt"), TransactionController_1.TransactionController.update);
        this.router.delete("/:id", TransactionController_1.TransactionController.delete);
    }
}
exports.default = new TransactionRouter().router;
