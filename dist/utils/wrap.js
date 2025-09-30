"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warp = void 0;
const warp = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.warp = warp;
