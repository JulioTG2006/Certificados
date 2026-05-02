import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { config } from "./env.js";

dotenv.config();

export const getConnection = async () => {
  return await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });
};