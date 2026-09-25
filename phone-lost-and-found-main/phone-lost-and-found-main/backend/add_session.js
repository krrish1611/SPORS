require("dotenv").config();
const mysql = require("mysql2/promise");

async function run() {
  const con = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { ca: process.env.DB_SSL_CERT }
  });

  try {
    await con.query("ALTER TABLE chats ADD COLUMN session_id VARCHAR(100)");
    console.log("Added session_id");
    
    // Update existing rows
    // Since we didn't have session_id before, let's just create one from deviceid + sender (if sender != owner) or just deviceid for legacy data.
    await con.query("UPDATE chats SET session_id = deviceid WHERE session_id IS NULL");
    
    console.log("Updated legacy rows");
  } catch (e) {
    console.error(e);
  } finally {
    await con.end();
  }
}
run();
