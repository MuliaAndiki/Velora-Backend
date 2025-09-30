import { Parser as Json2Csv } from "json2csv";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Buffer } from "node:buffer";

export async function toCSV<T>(rows: T[], fields?: string[]): Promise<string> {
  const parser = new Json2Csv({ fields });
  return parser.parse(rows as any);
}

export async function toExcel<T>(
  rows: T[],
  sheetName = "Data"
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  if (rows.length) {
    const headers = Object.keys(rows[0] as any);
    sheet.columns = headers.map((h) => ({ header: h, key: h }));
    rows.forEach((r) => sheet.addRow(r as any));
  }
  return workbook.xlsx.writeBuffer() as unknown as Buffer;
}

export async function toPDF<T>(rows: T[], title = "Report"): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 30 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  return new Promise((resolve) => {
    doc.fontSize(18).text(title, { underline: true });
    doc.moveDown();
    rows.forEach((r) => doc.fontSize(10).text(JSON.stringify(r)));
    doc.end();
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
