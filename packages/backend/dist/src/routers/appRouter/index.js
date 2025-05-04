"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const __1 = require("..");
const gedanke_1 = require("./gedanke");
const autor_1 = require("./autor");
const bewertung_1 = require("./bewertung");
const auth_1 = require("../auth");
// Move the router initialization after exporting the base utilities
exports.appRouter = (0, __1.router)({
    gedanke: gedanke_1.gedankeRouter,
    autor: autor_1.autorRouter,
    bewertung: bewertung_1.bewertungRouter,
    auth: auth_1.authRouter,
});
