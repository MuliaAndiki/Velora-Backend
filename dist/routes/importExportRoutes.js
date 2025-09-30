"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ImportExportController_1 = require("../controllers/ImportExportController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
class ImportExportRouter {
    constructor() {
        this.router = express_1.default.Router();
        this.routes();
    }
    routes() {
        this.router.use(auth_1.verifyToken);
        this.router.post("/import/csv", upload_1.upload.single("file"), new ImportExportController_1.ImportExportController().importCSV);
        this.router.get("/export", new ImportExportController_1.ImportExportController().exportAll);
        this.router.post("/backup", new ImportExportController_1.ImportExportController().backup);
    }
}
exports.default = new ImportExportRouter().router;
