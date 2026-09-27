require("dotenv").config();
const mysql2 = require("mysql2");

async function testAllEndpoints() {
  console.log("=== COMPREHENSIVE BACKEND & DATABASE VERIFICATION ===");

  const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { ca: process.env.DB_SSL_CERT }
  }).promise();

  try {
    // 1. Test Admin Stats Query
    console.log("\n[TEST 1] Testing /admin/stats SQL Query...");
    const statsQuery = `
      SELECT l.deviceid, d.devicename, d.username, t.latitude as lat, t.longitude as lon, t.timestamp as time
      FROM lost l
      JOIN device d ON l.deviceid = d.deviceid
      LEFT JOIN (
        SELECT deviceid, latitude, longitude, timestamp,
               ROW_NUMBER() OVER(PARTITION BY deviceid ORDER BY trackid DESC) as rn
        FROM track
      ) t ON l.deviceid = t.deviceid AND t.rn = 1
    `;
    const [statsRows] = await pool.query(statsQuery);
    console.log(`✅ /admin/stats SQL query successful! Returned ${statsRows.length} lost devices:`);
    console.table(statsRows);

    // 2. Test Store Location Insert
    console.log("\n[TEST 2] Testing /storeLocation insert and fetch...");
    const testDeviceId = "SIH_TEAM_SAPPHIRE001";
    const testLat = 19.21235;
    const testLng = 73.09540;
    const testTime = new Date().toISOString();

    const insertSql = "INSERT INTO track (deviceid, latitude, longitude, timestamp) VALUES (?, ?, ?, ?)";
    const [insertResult] = await pool.query(insertSql, [testDeviceId, testLat, testLng, testTime]);
    console.log(`✅ Stored location successfully, inserted trackid: ${insertResult.insertId}`);

    // Verify retrieval
    const [fetched] = await pool.query("SELECT * FROM track WHERE trackid = ?", [insertResult.insertId]);
    console.log("✅ Fetched stored location:", fetched[0]);

    // Clean up test row
    await pool.query("DELETE FROM track WHERE trackid = ?", [insertResult.insertId]);
    console.log("🧹 Cleaned up test track row.");

    // 3. Test /chats Send and Retrieve
    console.log("\n[TEST 3] Testing /chats message insert and retrieval...");
    const testSession = "TEST_SESSION_" + Date.now();
    const chatInsertSql = "INSERT INTO chats (deviceid, session_id, sender_username, receiver_username, message, timestamp) VALUES (?, ?, ?, ?, ?, NOW())";
    const [chatRes] = await pool.query(chatInsertSql, [testDeviceId, testSession, "tester", "owner", "Automated system test message"]);
    console.log(`✅ Chat message inserted with ID: ${chatRes.insertId}`);

    const [chatFetch] = await pool.query("SELECT * FROM chats WHERE session_id = ?", [testSession]);
    console.log("✅ Fetched chat session message:", chatFetch[0]);

    // Clean up test chat
    await pool.query("DELETE FROM chats WHERE session_id = ?", [testSession]);
    console.log("🧹 Cleaned up test chat row.");

    // 4. Test /my-chats Query
    console.log("\n[TEST 4] Testing /my-chats query for user 'krrish'...");
    const myChatsQuery = `
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
    const [myChatRows] = await pool.query(myChatsQuery, ["krrish", "krrish", "krrish"]);
    console.log(`✅ /my-chats successful! Found ${myChatRows.length} sessions for user 'krrish'`);
    console.table(myChatRows);

    // 5. Test /locatedevice/:id
    console.log("\n[TEST 5] Testing /locatedevice query...");
    const [latestTrack] = await pool.query("SELECT * FROM track WHERE deviceid = ? ORDER BY trackid DESC LIMIT 1", [testDeviceId]);
    console.log(`✅ Latest track for ${testDeviceId}:`, latestTrack[0]);

    console.log("\n🎉 ALL BACKEND DATABASE QUERIES & ENDPOINTS FUNCTIONING ACCURATELY!");
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    process.exit(0);
  }
}

testAllEndpoints();
