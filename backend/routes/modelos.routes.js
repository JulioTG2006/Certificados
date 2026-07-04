import express from "express";
import { getConnection } from "../config/db.js";

const router = express.Router();

/* 🔥 Crear modelo */
router.post("/", async (req, res) => {
  try {

    const {
      nombre,
      descripcion,
      plantilla_html,
      estado
    } = req.body;

    const conn = await getConnection();

    const [result] = await conn.query(
      `INSERT INTO modelos_certificado
      (
        nombre,
        descripcion,
        plantilla_html,
        estado
      )
      VALUES
      (
        ?,
        ?,
        ?,
        ?
      )`,
      [
        nombre,
        descripcion,
        plantilla_html,
        estado
      ]
    );

    res.json({
      message: "Modelo creado correctamente",
      id: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Error al crear modelo"
    });

  }
});

export default router;