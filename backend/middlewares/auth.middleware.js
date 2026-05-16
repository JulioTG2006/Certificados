import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Token requerido"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      config.jwtSecret
    );

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      error: "Token inválido"
    });
  }
};

export const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuario no autenticado"
        });
      }
  
      if (!allowedRoles.includes(req.user.rol_id)) {
        return res.status(403).json({
          error: "Acceso denegado"
        });
      }
  
      next();
    };
  };