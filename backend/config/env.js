import dotenv from "dotenv";

const env = process.env.NODE_ENV || "development";

dotenv.config({
  path: `.env.${env}`,
});

export const config = {
  env,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,

  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
};