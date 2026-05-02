import { getConnection } from "../config/db.js";

export const crearSolicitud = async (req, res) => {
  try {
    const { usuario_id, modelo_id } = req.body;

    if (!usuario_id || !modelo_id) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const conn = await getConnection();

    const [result] = await conn.query(
      "INSERT INTO solicitudes (usuario_id, modelo_id) VALUES (?, ?)",
      [usuario_id, modelo_id]
    );

    res.json({
      message: "Solicitud creada",
      id: result.insertId,
    });

  } catch (error) {
    throw error; // importante para middleware
  }
};