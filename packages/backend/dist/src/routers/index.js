"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.publicProcedure = exports.URL_STATIC = void 0;
const server_1 = require("@trpc/server");
exports.URL_STATIC = '/static';
const t = server_1.initTRPC.create();
exports.publicProcedure = t.procedure;
exports.router = t.router;
