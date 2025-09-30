"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCSV = toCSV;
exports.toExcel = toExcel;
exports.toPDF = toPDF;
const json2csv_1 = require("json2csv");
const exceljs_1 = __importDefault(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const node_buffer_1 = require("node:buffer");
async function toCSV(rows, fields) {
    const parser = new json2csv_1.Parser({ fields });
    return parser.parse(rows);
}
async function toExcel(rows, sheetName = "Data") {
    const workbook = new exceljs_1.default.Workbook();
    const sheet = workbook.addWorksheet(sheetName);
    if (rows.length) {
        const headers = Object.keys(rows[0]);
        sheet.columns = headers.map((h) => ({ header: h, key: h }));
        rows.forEach((r) => sheet.addRow(r));
    }
    return workbook.xlsx.writeBuffer();
}
async function toPDF(rows, title = "Report") {
    const doc = new pdfkit_1.default({ margin: 30 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    return new Promise((resolve) => {
        doc.fontSize(18).text(title, { underline: true });
        doc.moveDown();
        rows.forEach((r) => doc.fontSize(10).text(JSON.stringify(r)));
        doc.end();
        doc.on("end", () => resolve(node_buffer_1.Buffer.concat(chunks)));
    });
}
