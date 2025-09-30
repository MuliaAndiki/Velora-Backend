import { Request, Response } from "express";
import { Transaction } from "../models/Transaction";
import { toCSV, toExcel, toPDF } from "../services/export.service";
import {
  backupToDropbox,
  backupToGoogleDrive,
} from "../services/backup.service";
import { parse } from "csv-parse";
import fs from "fs";
import { warp } from "../utils/wrap";

export class ImportExportController {
  public importCSV = warp(
    async (req: Request, res: Response): Promise<void> => {
      const filePath = (req as any).file?.path;
      if (!filePath) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const rows: any[] = [];
      const parser = fs
        .createReadStream(filePath)
        .pipe(parse({ columns: true, trim: true }));
      for await (const record of parser) rows.push(record);

      const docs = rows.map((r) => ({
        amount: Number(r.amount),
        categoryId: r.categoryId,
        description: r.description,
        date: new Date(r.date),
        type: r.type === "income" ? "income" : "expense",
      }));

      const inserted = await Transaction.insertMany(docs);
      res.json({
        data: { inserted: inserted.length },
        message: "Transactions imported successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );

  public exportAll = warp(
    async (
      req: Request<{}, {}, { format?: string }>,
      res: Response
    ): Promise<void> => {
      const format = ((req.query as any).format || "csv").toString();
      const rows = await Transaction.find().lean();

      if (format === "csv") {
        const csv = await toCSV(rows);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="transactions.csv"'
        );
        res.send(csv);
        return;
      }

      if (format === "excel") {
        const buf = await toExcel(rows, "Transactions");
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="transactions.xlsx"'
        );
        res.send(Buffer.from(buf));
        return;
      }

      const buf = await toPDF(rows, "Transactions");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="transactions.pdf"'
      );
      res.send(Buffer.from(buf));
    }
  );

  public backup = warp(
    async (
      req: Request<{}, { provider: "drive" | "dropbox"; filePath: string }>,
      res: Response
    ): Promise<void> => {
      const { provider, filePath } = req.body;
      if (!provider || !filePath) {
        res.status(400).json({
          data: null,
          message: "Provider and filePath are required",
          code: 400,
          status: "error",
          errors: null,
        });
        return;
      }

      if (provider === "drive") await backupToGoogleDrive(filePath);
      else await backupToDropbox(filePath);

      res.json({
        data: null,
        message: "Backup completed successfully",
        code: 200,
        status: "success",
        errors: null,
      });
    }
  );
}
