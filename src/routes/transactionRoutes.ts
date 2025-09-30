import express from "express";
import { TransactionController } from "../controllers/TransactionController";
import { upload } from "../middleware/upload";
import { verifyToken } from "../middleware/auth";

class TransactionRouter {
  public router;

  constructor() {
    this.router = express.Router();
    this.routes();
  }

  private routes() {
    this.router.use(verifyToken);
    this.router.post(
      "/",
      upload.single("receipt"),
      TransactionController.create
    );
    this.router.get("/", TransactionController.getAll);
    this.router.get("/filter", TransactionController.filter);
    this.router.get("/export", TransactionController.exportData);
    this.router.get("/:id", TransactionController.getById);
    this.router.put(
      "/:id",
      upload.single("receipt"),
      TransactionController.update
    );
    this.router.delete("/:id", TransactionController.delete);
  }
}

export default new TransactionRouter().router;
