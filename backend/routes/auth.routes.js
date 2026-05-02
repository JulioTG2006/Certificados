import express from "express";
import { getConnection } from "../config/db.js";

const router = express.Router();

/* Registro usuario */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Validación básica */
    if (!email || !password) {
      return res.status(400).json({ error: "Campos obligatorios" });
    }

    /*Validación email */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    /* Validación contraseña */
    if (password.length < 6) {
      return res.status(400).json({ error: "Contraseña mínimo 6 caracteres" });
    }

    const conn = await getConnection();

    /* 🔍 Verificar si ya existe */
    const [exist] = await conn.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (exist.length > 0) {
      return res.status(400).json({ error: "Email ya registrado" });
    }

    /* 💾 Insertar usuario */
    const [result] = await conn.query(
    `INSERT INTO usuarios (email, password_hash, estado, rol_id)
    VALUES (?, ?, 'activo', 1)`,
    [email, password]
    );

    res.json({
      message: "Usuario registrado",
      id: result.insertId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en registro" });
  }
});

export default router;