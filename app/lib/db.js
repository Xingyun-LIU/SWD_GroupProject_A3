import mysql from "mysql2/promise";

export async function getDB() {
  return await mysql.createConnection(process.env.DATABASE_URL);
}