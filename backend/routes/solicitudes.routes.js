import express from "express";
import { getConnection } from "../config/db.js";
import { verifyToken, verifyRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* Crear solicitud */
router.post(
  "/",
  verifyToken,
  async (req, res) => {

    try {

      const {
        modelo_certificado_id,
        motivo
      } = req.body;

      if (
        !modelo_certificado_id ||
        !motivo
      ) {
        return res.status(400).json({
          error: "Todos los campos son obligatorios"
        });
      }

      const usuario_id =
        req.user.id;

      const conn =
        await getConnection();

      const [result] =
        await conn.query(
          `
          INSERT INTO solicitudes
          (
            usuario_id,
            modelo_certificado_id,
            motivo
          )
          VALUES
          (
            ?,
            ?,
            ?
          )
          `,
          [
            usuario_id,
            modelo_certificado_id,
            motivo
          ]
        );

      res.status(201).json({
        message:
          "Solicitud registrada correctamente",
        id: result.insertId
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error registrando solicitud"
      });

    }

  }
);

/* Listar solicitudes */
router.get(
  "/",
  verifyToken,
  async (req, res) => {

    try {

      const conn =
        await getConnection();

      const [rows] =
        await conn.query(`
          SELECT
            s.id,
            s.estado,
            s.motivo,
            s.fecha_solicitud,
            u.email AS usuario,
            m.nombre AS modelo
          FROM solicitudes s
          JOIN usuarios u
            ON s.usuario_id = u.id
          JOIN modelos_certificado m
            ON s.modelo_certificado_id = m.id
          ORDER BY s.id DESC
        `);

      res.json(rows);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error obteniendo solicitudes"
      });

    }

  }
);


/* Historial de solicitudes del usuario */

router.get(
  "/mis-solicitudes",
  verifyToken,
  async (req, res) => {

    try {

      const usuario_id =
        req.user.id;

      const conn =
        await getConnection();

      const [rows] =
        await conn.query(
          `
          SELECT
            s.id,
            s.estado,
            s.motivo,
            s.fecha_solicitud,
            m.nombre AS modelo
          FROM solicitudes s
          JOIN modelos_certificado m
            ON s.modelo_certificado_id = m.id
          WHERE s.usuario_id = ?
          ORDER BY s.id DESC
          `,
          [usuario_id]
        );

      res.json(rows);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error obteniendo historial"
      });

    }

  }
);

/* SOLICITUDES PENDIENTES*/

router.get(
  "/admin/pendientes",
  verifyToken,
  verifyRole(2),
  async (req, res) => {

    try {

      const conn =
        await getConnection();

      const [rows] =
        await conn.query(`
          SELECT
            s.id,
            s.estado,
            s.motivo,
            s.fecha_solicitud,
            u.email AS usuario,
            m.nombre AS modelo
          FROM solicitudes s
          JOIN usuarios u
            ON s.usuario_id = u.id
          JOIN modelos_certificado m
            ON s.modelo_certificado_id = m.id
          WHERE s.estado = 'pendiente'
          ORDER BY s.id DESC
        `);

      res.json(rows);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error obteniendo solicitudes"
      });

    }

  }
);


/* Detalle de solicitud */

router.get(
  "/:id",
  verifyToken,
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const usuario_id =
        req.user.id;

      const conn =
        await getConnection();

      const [rows] =
        await conn.query(
          `
          SELECT
            s.id,
            s.estado,
            s.motivo,
            s.fecha_solicitud,
            m.nombre AS modelo
          FROM solicitudes s
          JOIN modelos_certificado m
            ON s.modelo_certificado_id = m.id
          WHERE
            s.id = ?
            AND s.usuario_id = ?
          `,
          [
            id,
            usuario_id
          ]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          error:
            "Solicitud no encontrada"
        });
      }

      res.json(
        rows[0]
      );

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error obteniendo solicitud"
      });

    }

  }
);


/* Aprobar solicitud */

router.put(
  "/:id/aprobar",
  verifyToken,
  verifyRole(2),
  async (req, res) => {

    try {

      const { id } = req.params;

      const conn =
        await getConnection();

      await conn.query(
        `
        UPDATE solicitudes
          SET
          estado='aprobada',
          fecha_resolucion=NOW()
      WHERE id=?
        `,
        [id]
      );

      res.json({
        message:
          "Solicitud aprobada correctamente"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error aprobando solicitud"
      });

    }

  }
);

/* Rechazar solicitud */

router.put(
  "/:id/rechazar",
  verifyToken,
  verifyRole(2),
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const { observacion } =
        req.body;

      const conn =
        await getConnection();

      await conn.query(
        `
        UPDATE solicitudes
        SET
          estado='rechazada',
          observacion=?,
          fecha_resolucion=NOW()
        WHERE id=?
        `,
        [
          observacion,
          id
        ]
      );

      res.json({
        message:
          "Solicitud rechazada correctamente"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error:
          "Error rechazando solicitud"
      });

    }

  }
);


export default router;