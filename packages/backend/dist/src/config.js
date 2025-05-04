"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGODB_URI = void 0;
exports.MONGODB_URI = process.env.MONGODB_URI;
if (!exports.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
}
