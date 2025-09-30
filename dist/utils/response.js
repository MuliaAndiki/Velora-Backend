"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.paged = paged;
function success(res, data, message = 'OK', code = 200) {
    return res.status(code).json({
        data,
        message,
        code,
        status: 'success',
        errors: null,
    });
}
function error(res, errors, message = 'Error', code = 500) {
    return res.status(code).json({
        data: null,
        message,
        code,
        status: 'error',
        errors: errors ?? null,
    });
}
function paged(res, items, totalData, totalPages, message = 'OK', code = 200) {
    const inner = {
        data: items,
        totalData,
        totalPages,
    };
    return res.status(code).json({
        data: inner,
        message,
        code,
        status: 'success',
        errors: null,
    });
}
