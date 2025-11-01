"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = __importDefault(require("../src/app"));
// Vercel's Node runtime forwards Express-compatible request/response objects,
// so we can re-use the same Express instance we run locally without an
// additional adapter layer. Using the Express types keeps the file independent
// from the optional `@vercel/node` package, which avoids build failures when
// the dependency is not installed (e.g. in production installs that skip dev
// dependencies).
function handler(req, res) {
    return (0, app_1.default)(req, res);
}
