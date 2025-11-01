"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const app_1 = __importDefault(require("../src/app"));
// Vercel chama essa função passando (req, res)
// Um app Express é ele mesmo um request handler válido.
// Então a gente simplesmente delega req/res pro Express.
function handler(req, res) {
    return (0, app_1.default)(req, res);
}
