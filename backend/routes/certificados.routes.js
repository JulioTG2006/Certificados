import express from "express";
import { getConnection } from "../config/db.js";
import {verifyToken,verifyRole} from "../middlewares/auth.middleware.js";
import PDFDocument from "pdfkit";

const router = express.Router();

/* Obtener modelos de certificados */
router.get("/modelos", async (req, res) => {
  try {

    const conn = await getConnection();

    const [modelos] = await conn.query(`
      SELECT
        id,
        nombre,
        descripcion,
        estado
      FROM modelos_certificado
      WHERE estado = 'activo'
    `);

    res.json(modelos);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error obteniendo modelos"
    });
  }
});

router.get(
    "/modelos/admin",
    verifyToken,
    verifyRole(2),
    async (req, res) => {
  
      try {
  
        const conn = await getConnection();
  
        const [modelos] = await conn.query(`
          SELECT
            id,
            nombre,
            descripcion,
            estado
          FROM modelos_certificado
        `);
  
        res.json(modelos);
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error: "Error obteniendo modelos"
        });
  
      }
  
    }
  );


router.get("/modelos/:id", async (req, res) => {
    try {
  
      const { id } = req.params;
  
      const conn = await getConnection();
  
      const [rows] = await conn.query(
        `
        SELECT
          id,
          nombre,
          descripcion,
          estado
        FROM modelos_certificado
        WHERE id = ?
        `,
        [id]
      );
  
      if (rows.length === 0) {
        return res.status(404).json({
          error: "Modelo no encontrado"
        });
      }
  
      res.json(rows[0]);
  
    } catch (error) {
  
      console.error(error);
  
      res.status(500).json({
        error: "Error obteniendo modelo"
      });
  
    }
});

router.post(
    "/modelos",
    verifyToken,
    verifyRole(2),
    async (req, res) => {
  
      try {
  
        const {
          nombre,
          descripcion
        } = req.body;
  
        if (!nombre || !descripcion) {
          return res.status(400).json({
            error: "Todos los campos son obligatorios"
          });
        }
  
        const conn = await getConnection();
  
        const [result] = await conn.query(
          `
          INSERT INTO modelos_certificado
          (
            nombre,
            descripcion,
            estado
          )
          VALUES
          (
            ?,
            ?,
            'activo'
          )
          `,
          [
            nombre,
            descripcion
          ]
        );
  
        res.json({
          message: "Modelo creado correctamente",
          id: result.insertId
        });
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error: "Error creando modelo"
        });
  
      }
  
    }
  );

  router.put(
    "/modelos/:id",
    verifyToken,
    verifyRole(2),
    async (req, res) => {
  
      try {
  
        const { id } = req.params;
  
        const {
          nombre,
          descripcion
        } = req.body;
  
        if (!nombre || !descripcion) {
          return res.status(400).json({
            error: "Todos los campos son obligatorios"
          });
        }
  
        const conn = await getConnection();
  
        await conn.query(
          `
          UPDATE modelos_certificado
          SET
            nombre = ?,
            descripcion = ?
          WHERE id = ?
          `,
          [
            nombre,
            descripcion,
            id
          ]
        );
  
        res.json({
          message:
            "Modelo actualizado correctamente"
        });
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error:
            "Error actualizando modelo"
        });
  
      }
  
    }
  );

  router.put(
    "/modelos/:id/activar",
    verifyToken,
    verifyRole(2),
    async (req, res) => {
  
      try {
  
        const { id } = req.params;
  
        const conn = await getConnection();
  
        await conn.query(
          `
          UPDATE modelos_certificado
          SET estado = 'activo'
          WHERE id = ?
          `,
          [id]
        );
  
        res.json({
          message:
            "Modelo activado correctamente"
        });
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error:
            "Error activando modelo"
        });
  
      }
  
    }
  );

  router.put(
    "/modelos/:id/desactivar",
    verifyToken,
    verifyRole(2),
    async (req, res) => {
  
      try {
  
        const { id } = req.params;
  
        const conn = await getConnection();
  
        await conn.query(
          `
          UPDATE modelos_certificado
          SET estado = 'inactivo'
          WHERE id = ?
          `,
          [id]
        );
  
        res.json({
          message:
            "Modelo desactivado correctamente"
        });
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error:
            "Error desactivando modelo"
        });
  
      }
  
    }
  );

  //PDF GENERATION
  router.get(
    "/generar/:id",
    async (req, res) => {
  
      try {
  
        const { id } =
          req.params;
  
        const conn =
          await getConnection();
  
        const [rows] =
          await conn.query(
            `
            SELECT
              s.id,
              s.estado,
              s.fecha_resolucion,
              s.codigo_verificacion,
              u.email,
              m.nombre
            FROM solicitudes s
            JOIN usuarios u
              ON s.usuario_id = u.id
            JOIN modelos_certificado m
              ON s.modelo_certificado_id = m.id
            WHERE s.id = ?
            `,
            [id]
          );
  
        if (
          rows.length === 0
        ) {
  
          return res
            .status(404)
            .json({
              error:
                "Solicitud no encontrada"
            });
  
        }
  
        const solicitud =
          rows[0];
  
        if (
          solicitud.estado !==
          "aprobada"
        ) {
  
          return res
            .status(400)
            .json({
              error:
                "La solicitud aún no está aprobada"
            });
  
        }
  
        const doc =
          new PDFDocument({
            size: "A4",
            margin: 50
          });
  
        res.setHeader(
          "Content-Type",
          "application/pdf"
        );
  
        res.setHeader(
          "Content-Disposition",
          `inline; filename=certificado-${id}.pdf`
        );
  
        doc.pipe(res);
  
        /* Borde */
  
        doc.rect(
          40,
          40,
          515,
          760
        ).stroke();
  
        /* Título */
  
        doc
          .fontSize(28)
          .text(
            "CERTIFICADO",
            {
              align: "center"
            }
          );
  
        doc.moveDown(2);
  
        /* Texto principal */
  
        doc
          .fontSize(16)
          .text(
            "La Institución Educativa certifica que:",
            {
              align: "center"
            }
          );
  
        doc.moveDown();
  
        /* Usuario */
  
        doc
          .fontSize(24)
          .text(
            solicitud.email,
            {
              align: "center"
            }
          );
  
        doc.moveDown(2);
  
        /* Descripción */
  
        doc
          .fontSize(16)
          .text(
            "Ha completado satisfactoriamente el trámite correspondiente al documento:",
            {
              align: "center"
            }
          );
  
        doc.moveDown();
  
        /* Nombre certificado */
  
        doc
          .fontSize(20)
          .text(
            solicitud.nombre,
            {
              align: "center"
            }
          );
  
        doc.moveDown(4);
  
        /* Fecha */
  
        doc
          .fontSize(14)
          .text(
            `Fecha de emisión: ${
              solicitud.fecha_resolucion
                ? new Date(
                    solicitud.fecha_resolucion
                  ).toLocaleDateString()
                : new Date()
                    .toLocaleDateString()
            }`,
            {
              align: "center"
            }
          );
  
        doc.moveDown(6);
  
        /* Firma */
  
        doc.text(
          "_________________________",
          {
            align: "center"
          }
        );
  
        doc.text(
          "Dirección Académica",
          {
            align: "center"
          }
        );
  
        /* Código de verificación */
  
        doc.moveDown(3);
  
        doc
          .fontSize(12)
          .text(
            `Código de verificación: ${solicitud.codigo_verificacion}`,
            {
              align: "center"
            }
          );
  
        doc.end();
  
      } catch (error) {
  
        console.error(error);
  
        res.status(500).json({
          error:
            "Error generando PDF"
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

      const { id } =
        req.params;

      const codigo =
        `CERT-${Date.now()}`;

      const conn =
        await getConnection();

      await conn.query(
        `
        UPDATE solicitudes
        SET
          estado='aprobada',
          fecha_resolucion=NOW(),
          codigo_verificacion=?
        WHERE id=?
        `,
        [
          codigo,
          id
        ]
      );

      res.json({
        message:
          "Solicitud aprobada correctamente",
        codigo
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

export default router;