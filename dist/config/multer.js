"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const multer_1 = __importDefault(require("multer"));
const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"]);
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const ext = (file.originalname || '').toLowerCase().slice((file.originalname || '').lastIndexOf('.'));
    if (!allowedExt.has(ext)) {
        return cb(new Error('File type not allowed'));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });
exports.uploadImages = upload.fields([{ name: 'fotoProfile', maxCount: 1 }]);
exports.default = upload;
