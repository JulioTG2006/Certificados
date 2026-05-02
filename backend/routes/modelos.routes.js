import express from "express";
import { getConnection } from "../config/db.js";

const router = express.Router();

/* 🔥 Crear modelo */
router.post("/", async (req, res) => {
  try {
    const { titulo, descripcion, archivo_template, estado } = req.body;

    const conn = await getConnection();

    const [result] = await conn.query(
      `INSERT INTO modelos_certificados 
       (titulo, descripcion, archivo_template, estado)
       VALUES (?, ?, ?, ?)`,
      [titulo, descripcion, archivo_template, estado]
    );

    res.json({
      message: "Modelo creado",
      id: result.insertId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear modelo" });
  }
});

export default router;