require("dotenv").config();
let express = require("express");
let cors = require("cors");
let mysql2 = require("mysql2");

let app = express();
app.use(cors());
app.use(express.json());

let con = mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    ca: process.env.DB_SSL_CERT
  }
}).promise();

app.listen(9000, () => {
  console.log("Express is Ready on Port 9000");
});

app.post("/setlocation", async (req, res) => {
  const { deviceId, latitude, longitude } = req.body;
  const query = "INSERT INTO track (deviceid, lat, lon) VALUES (?,?,?)";
  
  try {
    await con.query(query, [deviceId, latitude, longitude]);
    res.status(200).json({ success: true, message: "Location saved to MySQL" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/register", async (req, res) => {
  const { username, contact, address, password, role } = req.body;
  if (!username || !contact || !address || !password) {
    return res.status(400).json({ error: "Missing fields in register request!!" });
  }

  const userRole = role || 'user';
  const query = "INSERT into users (username, contact, address, password, role) VALUES (?, ?, ?, ?, ?)";
  
  try {
    await con.query(query, [username, contact, address, password, userRole]);
    res.json({ success: true, message: "User registered succesfully!!" });
  } catch (err) {
    console.log("INSERT ERROR: ", err);
    res.status(500).json({ error: "Database Query Failed!!" });
  }
});

app.post("/register-device", async (req, res) => {
  const { devicename, username, imei, serialno } = req.body;
  if (!devicename || !username) {
    return res.status(400).json({ error: "Missing required fields in register device request!!" });
  }

  try {
    const fetchQuery = "SELECT deviceid FROM device WHERE deviceid LIKE 'SIH_TEAM_SAPPHIRE%' ORDER BY CAST(SUBSTRING(deviceid, 18) AS UNSIGNED) DESC LIMIT 1";
    const [rows] = await con.query(fetchQuery);

    let nextNumber = 1;
    if (rows.length > 0) {
      const lastId = rows[0].deviceid;
      const lastNumberMatch = lastId.match(/SIH_TEAM_SAPPHIRE(\d+)/);
      if (lastNumberMatch) {
        nextNumber = parseInt(lastNumberMatch[1], 10) + 1;
      }
    }
    const deviceid = `SIH_TEAM_SAPPHIRE${nextNumber.toString().padStart(3, '0')}`;

    const query = "INSERT into device (deviceid, devicename, username, imei, serialno) VALUES (?, ?, ?, ?, ?)";
    await con.query(query, [deviceid, devicename, username, imei || null, serialno || null]);
    
    res.json({ success: true, message: "Device registered successfully!!", deviceid });
  } catch (err) {
    console.log("INSERT ERROR: ", err);
    res.status(500).json({ error: "Database Query Failed!!" });
  }
});

app.post("/storeLocation", async (req, res) => {
  const { deviceId, latitude, longitude, timestamp } = req.body;

  console.log("📥 storeLocation hit:", { deviceId, latitude, longitude, timestamp });

  if (!deviceId || latitude === undefined || longitude === undefined || !timestamp) {
    console.warn("⚠️ Missing fields:", { deviceId, latitude, longitude, timestamp });
    return res.status(400).json({ error: "Missing fields in request" });
  }

  try {
    // Check for the most recent entry to enforce 5-second throttle
    let selectSql;
    let lastTimestamp = null;

    // Query latest location by trackid (primary key AUTO_INCREMENT)
    try {
      selectSql = "SELECT timestamp FROM track WHERE deviceid = ? ORDER BY trackid DESC LIMIT 1";
      const [results] = await con.query(selectSql, [deviceId]);
      if (results.length > 0) {
        lastTimestamp = results[0].timestamp;
      }
    } catch (selectErr) {
      console.warn("⚠️ Could not query track table, proceeding with insert:", selectErr.message);
    }

    let shouldInsert = true;
    if (lastTimestamp) {
      const lastTime = new Date(lastTimestamp);
      const now = new Date(timestamp);
      const diffSeconds = (now - lastTime) / 1000;
      if (diffSeconds < 5) {
        shouldInsert = false;
      }
    }

    if (shouldInsert) {
      // Try with 'latitude/longitude' columns first (the expected schema)
      try {
        const insertSql = "INSERT INTO track (deviceid, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)";
        await con.query(insertSql, [deviceId, latitude, longitude, timestamp]);
        console.log(`✅ Location stored for deviceId: ${deviceId}`);
        return res.json({ success: true, message: "Location stored successfully" });
      } catch (insertErr) {
        // If columns don't exist, try the legacy column names (lat, lon)
        if (insertErr.code === 'ER_BAD_FIELD_ERROR') {
          console.warn("⚠️ 'latitude/longitude' columns not found, trying 'lat/lon' fallback...");
          try {
            const fallbackSql = "INSERT INTO track (deviceid, lat, lon) VALUES (?, ?, ?)";
            await con.query(fallbackSql, [deviceId, latitude, longitude]);
            console.log(`✅ Location stored (fallback columns) for deviceId: ${deviceId}`);
            return res.json({ success: true, message: "Location stored successfully (legacy columns)" });
          } catch (fallbackErr) {
            console.error("❌ Fallback insert also failed:", fallbackErr.message);
            return res.status(500).json({ error: "Database operation failed", details: fallbackErr.message });
          }
        }
        console.error("❌ Insert failed:", insertErr.message);
        return res.status(500).json({ error: "Database operation failed", details: insertErr.message });
      }
    } else {
      return res.json({ success: true, message: "Skipped insert, recent record exists" });
    }
  } catch (err) {
    console.error("❌ Error in storeLocation:", err);
    return res.status(500).json({ error: "Database operation failed", details: err.message });
  }
});

app.get("/getlocation/:deviceId", async (req, res) => {
  const { deviceId } = req.params;
  const query = "SELECT * FROM track WHERE deviceid = ?";

  try {
    const [results] = await con.query(query, [deviceId]);
    if (results.length > 0) {
      res.status(200).json({ success: true, data: results });
    } else {
      res.status(404).json({ success: false, message: "Location not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/reportlost/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  try {
    const selectQuery = 'SELECT username FROM device WHERE deviceid = ?';
    const [results] = await con.query(selectQuery, [deviceId]);
    
    if (results.length > 0) {
      const username = results[0].username;
      
      const checkLostQuery = 'SELECT * FROM lost WHERE deviceid = ?';
      const [lostResults] = await con.query(checkLostQuery, [deviceId]);
      
      if (lostResults.length > 0) {
        return res.status(200).json({ success: true, message: 'Device is already reported as lost' });
      }
      
      const insertQuery = 'INSERT INTO lost (deviceid, username) VALUES (?,?)';
      await con.query(insertQuery, [deviceId, username]);
      res.status(200).json({ success: true, message: 'Device reported lost' });
    } else {
      res.status(404).json({ success: false, message: 'Device not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/markfound/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  try {
    const [result] = await con.query('DELETE FROM lost WHERE deviceid = ?', [deviceId]);
    if (result.affectedRows > 0) { 
      res.status(200).json({ success: true, message: 'Device marked as found' }); 
    } else { 
      res.status(404).json({ success: false, message: 'Device was not marked as lost' }); 
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const userQuery = "SELECT * FROM users WHERE username = ? AND password = ?";
    const [userResult] = await con.query(userQuery, [username, password]);

    if (userResult.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const user = userResult[0];

    const deviceQuery = "SELECT * FROM device WHERE username = ?";
    const [devices] = await con.query(deviceQuery, [username]);

    return res.status(200).json({
      success: true,
      token: "dummy-token-" + user.userid, // Replace with JWT later
      user: {
        id: user.userid,
        username: user.username,
        role: user.role,
        devices: devices.map(d => ({
          deviceid: d.deviceid,
          devicename: d.devicename,
          lat: d.lat,
          lon: d.lon,
          address: d.address,
          time: d.time
        }))
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
});

app.get("/device/:id", async (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM device WHERE deviceid = ?";
  
  try {
    const [results] = await con.query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).send("Device not found");
    }
    const device = results[0];
    res.json({
      id: device.deviceid,
      name: device.devicename,
      location: {
        lat: device.lat,
        lng: device.lon,
        address: device.address || "Unknown location"
      },
      lastSeen: device.time || "Unknown"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Database error");
  }
});

app.get("/locatedevice/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let results;
    try {
      [results] = await con.query("SELECT * FROM track WHERE deviceid = ? ORDER BY trackid DESC LIMIT 1", [id]);
    } catch (orderErr) {
      [results] = await con.query("SELECT * FROM track WHERE deviceid = ? LIMIT 1", [id]);
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: "Device not found" });
    }
    const device = results[0];
    const lat = device.latitude !== undefined && device.latitude !== null ? device.latitude : (device.lat ?? 0);
    const lng = device.longitude !== undefined && device.longitude !== null ? device.longitude : (device.lon ?? 0);
    res.json({
      id: device.deviceid,
      name: device.devicename || `Device (${device.deviceid})`,
      location: {
        lat: Number(lat),
        lng: Number(lng),
        address: device.address || "Unknown location",
      },
      lastSeen: device.timestamp || device.time || "Unknown",
    });
  } catch (err) {
    console.error("Error in locatedevice:", err);
    return res.status(500).json({ success: false, error: "Database error" });
  }
});

// ----------------------------------------------------
// NEW ADMIN & CHAT ENDPOINTS
// ----------------------------------------------------

app.post("/admin/register-police", async (req, res) => {
  const { username, contact, address, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const query = "INSERT into users (username, contact, address, password, role) VALUES (?, ?, ?, ?, 'police')";
  try {
    await con.query(query, [username, contact || '', address || '', password]);
    res.json({ success: true, message: "Police account registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/admin/stats", async (req, res) => {
  try {
    // Get total lost devices count
    const [lostRows] = await con.query("SELECT COUNT(*) as count FROM lost");
    
    // Get lost devices with their last known locations
    // We join lost, device, and track tables to get the latest lat/lon for each lost device
    const query = `
      SELECT l.deviceid, d.devicename, d.username, t.latitude as lat, t.longitude as lon, t.timestamp as time
      FROM lost l
      JOIN device d ON l.deviceid = d.deviceid
      LEFT JOIN (
        SELECT deviceid, latitude, longitude, timestamp,
               ROW_NUMBER() OVER(PARTITION BY deviceid ORDER BY trackid DESC) as rn
        FROM track
      ) t ON l.deviceid = t.deviceid AND t.rn = 1
    `;
    const [devices] = await con.query(query);
    
    res.json({ success: true, count: lostRows[0].count, devices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/admin/chats", async (req, res) => {
  const { search } = req.query; // search by username
  try {
    let query = `
      SELECT c.session_id, c.deviceid, d.devicename, MAX(c.timestamp) as last_activity, COUNT(c.chat_id) as message_count
      FROM chats c
      LEFT JOIN device d ON c.deviceid = d.deviceid
    `;
    let params = [];
    if (search) {
      query += " WHERE c.sender_username LIKE ? OR c.receiver_username LIKE ?";
      params = [`%${search}%`, `%${search}%`];
    }
    query += " GROUP BY c.session_id, c.deviceid, d.devicename ORDER BY last_activity DESC";
    
    const [rows] = await con.query(query, params);
    res.json({ success: true, sessions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/chats", async (req, res) => {
  const { deviceid, session_id, sender_username, receiver_username, message } = req.body;
  if (!deviceid || !session_id || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const query = "INSERT INTO chats (deviceid, session_id, sender_username, receiver_username, message) VALUES (?, ?, ?, ?, ?)";
    await con.query(query, [deviceid, session_id, sender_username, receiver_username || 'unknown', message]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/chats/:session_id", async (req, res) => {
  const { session_id } = req.params;
  try {
    const query = "SELECT * FROM chats WHERE session_id = ? ORDER BY timestamp ASC";
    const [rows] = await con.query(query, [session_id]);
    res.json({ success: true, chats: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/my-chats", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  try {
    const query = `
      SELECT c.session_id, c.deviceid, d.devicename, MAX(c.timestamp) as last_activity,
             (SELECT message FROM chats WHERE session_id = c.session_id ORDER BY timestamp DESC LIMIT 1) as last_message,
             MAX(c.sender_username) as sender_username, MAX(c.receiver_username) as receiver_username
      FROM chats c
      LEFT JOIN device d ON c.deviceid = d.deviceid
      WHERE c.sender_username = ? 
         OR c.receiver_username = ? 
         OR d.username = ?
      GROUP BY c.session_id, c.deviceid, d.devicename
      ORDER BY last_activity DESC
    `;
    const [rows] = await con.query(query, [username, username, username]);
    res.json({ success: true, sessions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// IMPORTANT: Export the app for Vercel
module.exports = app;