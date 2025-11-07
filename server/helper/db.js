import pkg from "pg";
import dotenv from "dotenv";

const environment = process.env.NODE_ENV || "development";
dotenv.config();

const { Pool } = pkg;

const openDb = () => {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:
      environment === "development"
        ? process.env.DB_NAME
        : process.env.TEST_DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  // Test the connection
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
  });

  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Database connection error:", err.message);
    } else {
      console.log("Database connected successfully");
    }
  });

  return pool;
};

const pool = openDb();

export { pool };
