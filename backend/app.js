import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getConnection } from "./config/db.js";
import { config } from "./config/env.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const testDB = async () => {
  try {
    const conn = await getConnection();
    await conn.query("SELECT 1");
    console.log("✅ Conectado a MySQL");
  } catch (error) {
    console.log("❌ Error de conexión:", error);
  }
};

testDB();

app.get("/health", async (req, res) => {
  try {
    const conn = await getConnection();
    await conn.query("SELECT 1");

    res.json({
      status: "OK",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "disconnected",
    });
  }
});

const PORT = config.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
