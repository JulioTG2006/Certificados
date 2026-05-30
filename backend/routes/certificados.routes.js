import express from "express";
import { getConnection } from "../config/db.js";
import {verifyToken,verifyRole} from "../middlewares/auth.middleware.js";

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

export default router;