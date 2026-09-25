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
});

app.listen(9000, () => {
  console.log("Express is Ready on Port 9000");
});

app.post("/setlocation", (req, res) => {
  const { deviceId, latitude, longitude } = req.body;

  let query = "INSERT INTO track (deviceid, lat, lon) VALUES (?,?,?)";
  con.query(query, [deviceId, latitude, longitude], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.status(200).json({ success: true, message: "Location saved to MySQL" });
  });
});

app.post("/register", (req, res)=>{
  const { username, contact, address, password} = req.body;
  if(!username || !contact || !address || !password){
    return res.status(400).json({ error: "Missing fields in register request!!"});
  }

  let query = "INSERT into users (username, contact, address, password) VALUES (?, ?, ?, ?)";
  con.query(query, [username, contact, address, password], (err, result)=>{
    if(err){
      console.log("INSERT ERROR: ", err);
      return res.status(500).json({ error: "Database Query Failed!!"});
    }

    else{
      return res.json({ success: true, message: "User registered succesfully!!" });
    }
  })
});

app.post("/storeLocation", (req, res) => {
    const { deviceId, latitude, longitude, timestamp } = req.body;
    console.log("hit");
    console.log("Store Location input: ", deviceId);
    console.log("Store Location input: ", latitude);
    console.log("Store Location input: ", longitude);
    console.log("Store Location input: ", timestamp);

    if (!deviceId || !latitude || !longitude || !timestamp) {
        return res.status(400).json({ error: "Missing fields in request" });
    }

    // Step 1: Get the most recent entry for this device
    let selectSql = "SELECT timestamp FROM track WHERE deviceid = ? ORDER BY timestamp DESC LIMIT 1";
    con.query(selectSql, [deviceId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching last record:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        let now = new Date(timestamp);
        let shouldInsert = false;

        if (results.length === 0) {
            // No previous record, insert
            shouldInsert = true;
        } else {
            let lastTime = new Date(results[0].timestamp);
            let diffSeconds = (now - lastTime) / 1000; // difference in seconds

            if (diffSeconds >= 5) {
                shouldInsert = true;
            }
        }

        if (shouldInsert) {
            let insertSql = "INSERT INTO track (deviceid, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)";
            con.query(insertSql, [deviceId, latitude, longitude, timestamp], (err2) => {
                if (err2) {
                    console.error("❌ Error inserting data:", err2);
                    return res.status(500).json({ error: "Database insert failed" });
                }
                console.log(`✅ Location stored for deviceId: ${deviceId}`);
                return res.json({ success: true, message: "Location stored successfully" });
            });
        } else {
            //console.log(`⏳ Skipped insert for ${deviceId} (less than 5 sec since last)`);
            return res.json({ success: true, message: "Skipped insert, recent record exists" });
        }
    });
});


app.get("/getlocation/:deviceId", (req, res) => {
  const deviceId = req.params.deviceId;

  con.query("SELECT * FROM track WHERE deviceid = ?", [deviceId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    if (result.length > 0) {
      res.status(200).json({ success: true, data: result });
    } else {
      res.status(404).json({ success: false, message: "Location not found" });
    }
  });
});

app.post("/reportlost/:deviceId", (req, res) => {
  const deviceId = req.params.deviceId;

  con.query("SELECT username FROM device WHERE deviceid = ?", [deviceId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    if (result.length > 0) {
      const username = result[0].username;

      con.query("INSERT INTO lost (deviceid, username) VALUES (?,?)", [deviceId, username], (err2) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.status(200).json({ success: true, message: "Device reported lost" });
      });
    } else {
      res.status(404).json({ success: false, message: "Device not found" });
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  let query = "SELECT * FROM users WHERE username = ? AND password = ?";
  con.query(query, [username, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    if (result.length === 0) {
      console.log("Invalid Credentials!!");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result[0];

    // Now fetch devices for this user
    let deviceQuery = "SELECT * FROM device WHERE username = ?";
    con.query(deviceQuery, [username], (err2, devices) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ success: false, error: "Database error" });
      }

      console.log("Login Success!!");
      return res.status(200).json({
        success: true,
        token: "dummy-token-" + user.id, // later replace with JWT
        user: {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
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
    });
  });
});

// Search device by ID
app.get("/device/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM device WHERE deviceid = ?";
  con.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

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
  });
});

// Search device by ID (fresh location when selected)
app.get("/locatedevice/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM track WHERE deviceid = ? ORDER BY timestamp DESC LIMIT 1";
  con.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Device not found" });
    }

    const device = results[0];

      console.log(device.trackid);
      console.log(device.deviceid);
      console.log(device.latitude);
      console.log(device.longitude);
      console.log(device.address);
      console.log(device.time);

    res.json({
      id: device.deviceid,
      name: device.devicename || "Unknown device",
      location: {
        lat: device.latitude,   // depends on your column name
        lng: device.longitude, // depends on your column name
        address: device.address || "Unknown location",
      },
      lastSeen: device.timestamp || "Unknown",
    });
  });
});

module.exports = app;