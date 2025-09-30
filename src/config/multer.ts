import multer from 'multer';
import type { Request } from 'express';

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"]);

const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = (file.originalname || '').toLowerCase().slice((file.originalname || '').lastIndexOf('.'));
  if (!allowedExt.has(ext)) {
    return cb(new Error('File type not allowed'));
  }
  cb(null, true);
};

const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

export const uploadImages = upload.fields([{ name: 'fotoProfile', maxCount: 1 }]);

export default upload;
