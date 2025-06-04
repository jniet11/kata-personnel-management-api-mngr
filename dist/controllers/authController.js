"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Los datos que llegana la back son: ", req.body);
    if (!email || !password) {
        res
            .status(400)
            .json({ message: "Correo electrónico y contraseña son requeridos." });
    }
    try {
        const query = "SELECT id, email, password_hash FROM auth_credentials WHERE email = ?";
        const { results } = await (0, db_1.executeQuery)(query, [email]);
        console.log("Resultados de la consulta:", results);
        if (!Array.isArray(results) || results.length === 0) {
            res.status(401).json({ message: "Credenciales inválidas." });
        }
        const user = results[0];
        const isPasswordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            res.status(401).json({ message: "Credenciales inválidas." });
        }
        const jwtSecret = process.env.JWT_SECRET;
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
        if (!jwtSecret) {
            console.error("JWT_SECRET no está definido en las variables de entorno.");
            res.status(500).json({ message: "Error de configuración del servidor." });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, jwtSecret, {
            expiresIn: jwtExpiresIn || "7h",
        });
        if (!jwtSecret) {
            console.error("JWT_SECRET no está definido en las variables de entorno.");
            res.status(500).json({ message: "Error de configuración del servidor." });
        }
        else {
            res.status(200).json({ token });
        }
    }
    catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};
exports.login = login;
