"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(config_1.MONGODB_URI);
        console.log('MongoDB connected');
    }
    catch (err) {
        console.error(err);
    }
};
exports.connectDB = connectDB;
