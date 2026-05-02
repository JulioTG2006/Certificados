import express from "express";
import { getConnection } from "../config/db.js";

const router = express.Router();

/*Crear solicitud */
router.post("/", async (req, res) => {
  try {
    const { usuario_id, modelo_id } = req.body;

    const conn = await getConnection();

    const [result] = await conn.query(
      `INSERT INTO solicitudes (usuario_id, modelo_id)
       VALUES (?, ?)`,
      [usuario_id, modelo_id]
    );

    res.json({
      message: "Solicitud creada",
      id: result.insertId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al crear solicitud (posible FK inválida)",
    });
  }
});

// Listar solicitudes con JOIN //
router.get("/", async (req, res) => {
  try {
    const conn = await getConnection();

    const [rows] = await conn.query(`
      SELECT 
        s.id,
        s.estado,
        u.email AS usuario,
        m.titulo AS modelo
      FROM solicitudes s
      JOIN usuarios u ON s.usuario_id = u.id
      JOIN modelos_certificados m ON s.modelo_id = m.id
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener solicitudes" });
  }
});

export default router;