import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/db";
import { RowDataPacket } from "mysql2";

interface AuthCredentials extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log("Los datos que llegana la back son: ", req.body);

  if (!email || !password) {
    res
      .status(400)
      .json({ message: "Correo electrónico y contraseña son requeridos." });
  }

  try {
    const query =
      "SELECT id, email, password_hash FROM auth_credentials WHERE email = ?";
    const { results } = await executeQuery(query, [email]);

    console.log("Resultados de la consulta:", results);

    if (!Array.isArray(results) || results.length === 0) {
      res.status(401).json({ message: "Credenciales inválidas." });
    }

    const user = (results as RowDataPacket[])[0] as AuthCredentials;

    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Credenciales inválidas." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret) {
      console.error("JWT_SECRET no está definido en las variables de entorno.");
      res.status(500).json({ message: "Error de configuración del servidor." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret as any,
      {
        expiresIn: jwtExpiresIn || "7h",
      } as jwt.SignOptions
    );

    if (!jwtSecret) {
      console.error("JWT_SECRET no está definido en las variables de entorno.");
      res.status(500).json({ message: "Error de configuración del servidor." });
    } else {
      res.status(200).json({ token });
    }
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
