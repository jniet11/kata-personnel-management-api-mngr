"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                console.error("JWT_SECRET no está definido en las variables de entorno.");
                res
                    .status(500)
                    .json({ message: "Error de configuración del servidor." });
            }
            else {
                const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
                req.user = decoded;
                next();
            }
        }
        catch (error) {
            console.error("Error de autenticación:", error);
            res.status(401).json({ message: "No autorizado, token falló." });
        }
    }
    if (!token) {
        res.status(401).json({ message: "No autorizado, no hay token." });
    }
};
exports.protect = protect;
