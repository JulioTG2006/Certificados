import express from "express";
import { getConnection } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* Registro usuario */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Campos obligatorios"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email inválido"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Contraseña mínimo 6 caracteres"
      });
    }

    const conn = await getConnection();

    const [exist] = await conn.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (exist.length > 0) {
      return res.status(400).json({
        error: "Email ya registrado"
      });
    }

    /* bcrypt aquí */
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await conn.query(
      `
      INSERT INTO usuarios (email, password_hash, estado, rol_id)
      VALUES (?, ?, 'activo', 1)
      `,
      [email, hashedPassword]
    );

    res.json({
      message: "Usuario registrado",
      id: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error en registro"
    });
  }
});

/* Login usuario */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Validación básica */
    if (!email || !password) {
      return res.status(400).json({
        error: "Campos obligatorios"
      });
    }

    const conn = await getConnection();

    /* Buscar usuario */
    const [users] = await conn.query(
      `
      SELECT id, email, password_hash, estado, rol_id
      FROM usuarios
      WHERE email = ?
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Usuario no encontrado"
      });
    }

    const user = users[0];

    /* Validar estado */
    if (user.estado !== "activo") {
      return res.status(403).json({
        error: "Usuario inactivo"
      });
    }

    /* Validar contraseña */
const isValidPassword = await bcrypt.compare(
    password,
      user.password_hash
    );

      if (!isValidPassword) {
      return res.status(401).json({
      error: "Contraseña incorrecta"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol_id: user.rol_id
      },
      config.jwtSecret,
      {
        expiresIn: "2h"
      }
    );
    
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        rol_id: user.rol_id
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error en login"
    });
  }
});

/* Obtener todos los usuarios */
router.get(
  "/users",
  verifyToken,
  verifyRole(2),
  async (req, res) => {
  try {


    const conn = await getConnection();

    const [users] = await conn.query(`
      SELECT id, email, estado, rol_id
      FROM usuarios
    `);

    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo usuarios"
    });
  }
});

router.get(
  "/profile",
  verifyToken,
  async (req, res) => {
    try {

      const conn = await getConnection();

      const [users] = await conn.query(
        `
        SELECT
          id,
          email,
          estado,
          rol_id,
          fecha_registro
        FROM usuarios
        WHERE id = ?
        `,
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          error: "Usuario no encontrado"
        });
      }

      res.json(users[0]);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Error obteniendo perfil"
      });
    }
  }
);


router.put(
  "/profile",
  verifyToken,
  async (req, res) => {
    try {

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Email obligatorio"
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Email inválido"
        });
      }

      const conn = await getConnection();

      const [exist] = await conn.query(
        `
        SELECT id
        FROM usuarios
        WHERE email = ?
        AND id != ?
        `,
        [email, req.user.id]
      );

      if (exist.length > 0) {
        return res.status(400).json({
          error: "Email ya registrado"
        });
      }

      await conn.query(
        `
        UPDATE usuarios
        SET email = ?
        WHERE id = ?
        `,
        [email, req.user.id]
      );

      res.json({
        message: "Perfil actualizado correctamente"
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Error actualizando perfil"
      });
    }
  }
);

export default router;