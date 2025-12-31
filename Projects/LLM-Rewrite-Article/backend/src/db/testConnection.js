import dotenv from "dotenv";
dotenv.config();

import pool from "./index.js";

console.log("DB_USER =", process.env.DB_USER);
console.log("DB_NAME =", process.env.DB_NAME);

async function testDB() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
    process.exit(0);
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

testDB();
