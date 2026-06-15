import express from "express";
import { getConnection } from "../config/db.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* Crear mensaje soporte */

router.post(
  "/",
  verifyToken,
  async (req, res) => {

    try {

      const {
        asunto,
        mensaje
      } = req.body;

      const conn =
        await getConnection();

      await conn.query(
        `
        INSERT INTO mensajes_soporte
        (
          usuario_id,
          asunto,
          mensaje
        )
        VALUES (?, ?, ?)
        `,
        [
          req.user.id,
          asunto,
          mensaje
        ]
      );

      res.json({
        message:
          "Mensaje enviado correctamente"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error enviando mensaje"
      });

    }

  }
);


/* Listar mensajes soporte */

router.get(
    "/",
    verifyToken,
    verifyRole(2),
    async (req, res) => {
  
      try {
  
        const conn =
          await getConnection();
  
        const [rows] =
          await conn.query(
            `
            SELECT
              m.id,
              m.asunto,
              m.mensaje,
              m.estado,
              m.respuesta,
              m.fecha_envio,
              u.email
            FROM mensajes_soporte m
            JOIN usuarios u
              ON m.usuario_id = u.id
            ORDER BY m.fecha_envio DESC
            `
          );
  
        res.json(rows);
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error:
            "Error obteniendo mensajes"
        });
  
      }
  
    }
  );


  /* Responder mensaje */

router.put(
    "/:id/responder",
    verifyToken,
    verifyRole(2),
    async (req, res) => {
  
      try {
  
        const { id } =
          req.params;
  
        const { respuesta } =
          req.body;
  
        const conn =
          await getConnection();
  
        await conn.query(
          `
          UPDATE mensajes_soporte
          SET
            respuesta=?,
            estado='respondido'
          WHERE id=?
          `,
          [
            respuesta,
            id
          ]
        );
  
        res.json({
          message:
            "Respuesta enviada correctamente"
        });
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error:
            "Error respondiendo mensaje"
        });
  
      }
  
    }
  );

export default router;