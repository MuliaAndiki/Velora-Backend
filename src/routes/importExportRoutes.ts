import express from "express";
import { ImportExportController } from "../controllers/ImportExportController";
import { upload } from "../middleware/upload";
import { verifyToken } from "../middleware/auth";

class ImportExportRouter {
  public router;

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.use(verifyToken);
    this.router.post(
      "/import/csv",
      upload.single("file"),
      new ImportExportController().importCSV
    );
    this.router.get("/export", new ImportExportController().exportAll);
    this.router.post("/backup", new ImportExportController().backup);
  }
}

export default new ImportExportRouter().router;
