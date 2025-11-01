"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
// Vercel chama essa função passando (req, res).
// Um app Express já implementa a interface de request handler do Node.
// Então devolvemos o próprio app para que atenda as requisições diretamente.
exports.default = app_1.default;
