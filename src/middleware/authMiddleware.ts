import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error(
          "JWT_SECRET no está definido en las variables de entorno."
        );
        res
          .status(500)
          .json({ message: "Error de configuración del servidor." });
      } else {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
      }
    } catch (error) {
      console.error("Error de autenticación:", error);
      res.status(401).json({ message: "No autorizado, token falló." });
    }
  }

  if (!token) {
    res.status(401).json({ message: "No autorizado, no hay token." });
  }
};
