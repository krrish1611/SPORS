require("dotenv").config();
const mysql = require("mysql2/promise");

async function migrate() {
  const con = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: {
      ca: process.env.DB_SSL_CERT
    }
  });

  try {
    console.log("Adding role column to users table...");
    try {
      await con.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
      console.log("Added role column.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("role column already exists.");
      } else {
        throw e;
      }
    }

    console.log("Creating chats table...");
    await con.query(`
      CREATE TABLE IF NOT EXISTS chats (
        chat_id INT AUTO_INCREMENT PRIMARY KEY,
        deviceid VARCHAR(45) NOT NULL,
        sender_username VARCHAR(45) NOT NULL,
        receiver_username VARCHAR(45) NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Chats table created.");

    console.log("Creating default admin account...");
    const [rows] = await con.query("SELECT * FROM users WHERE username = 'admin'");
    if (rows.length === 0) {
      await con.query(`
        INSERT INTO users (username, contact, address, password, role)
        VALUES ('admin', '0000000000', 'Admin HQ', 'admin', 'admin')
      `);
      console.log("Default admin account created.");
    } else {
      await con.query("UPDATE users SET role = 'admin' WHERE username = 'admin'");
      console.log("Admin account already exists, ensured role is 'admin'.");
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await con.end();
  }
}

migrate();
