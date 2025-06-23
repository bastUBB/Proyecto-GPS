"use strict";
import jwt from "jsonwebtoken";

export function authenticateJwt(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "No tienes permiso para acceder a este recurso",
        info: "Token no proporcionado"
      });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET || "TU_SECRET_KEY");
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "No tienes permiso para acceder a este recurso",
      info: err.message || "Token inválido"
    });
  }
}