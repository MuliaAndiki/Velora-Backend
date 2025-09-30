"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const response_1 = require("../utils/response");
function errorHandler(err, _req, res, _next) {
    console.error('Error:', err);
    const status = err?.status || 500;
    const message = err?.message || 'Internal server error';
    const errors = Array.isArray(err?.errors) ? err.errors : null;
    (0, response_1.error)(res, errors, message, status);
}
