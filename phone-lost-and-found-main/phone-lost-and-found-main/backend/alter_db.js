const mysql = require("mysql2/promise");

async function main() {
  const con = await mysql.createConnection({
    host: "findmy-fundraiser-portal.c.aivencloud.com",
    port: "23890",
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "findmy",
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log("Adding columns to device table...");
    await con.query("ALTER TABLE device ADD COLUMN imei VARCHAR(50) DEFAULT NULL");
    await con.query("ALTER TABLE device ADD COLUMN serialno VARCHAR(50) DEFAULT NULL");
    console.log("Columns added successfully");
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    con.end();
  }
}

main();
