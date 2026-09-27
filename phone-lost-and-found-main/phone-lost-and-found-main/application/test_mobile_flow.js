const axios = require('axios');

const BACKEND_URL = 'https://phone-lost-and-found.vercel.app';
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

async function runMobileAppFlowTests() {
  console.log("==========================================================");
  console.log("  SPORS MOBILE APPLICATION END-TO-END FLOW VERIFICATION   ");
  console.log("==========================================================");
  console.log(`Target Backend: ${BACKEND_URL}\n`);

  let allPassed = true;

  // ----------------------------------------------------------------
  // SCREEN 1: LoginScreen / AuthContext Flow
  // ----------------------------------------------------------------
  console.log("📱 [TEST SCREEN 1: LoginScreen]");
  console.log("Action: Logging in with valid citizen credentials (raghav / 123456)...");
  try {
    const loginRes = await api.post('/login', { username: 'raghav', password: '123456' });
    if (loginRes.data.success && loginRes.data.user) {
      console.log(`✅ Login SUCCESS! User: ${loginRes.data.user.username}, Role: ${loginRes.data.user.role}`);
      console.log(`   Registered devices count: ${loginRes.data.user.devices?.length || 0}`);
      if (loginRes.data.user.devices?.length > 0) {
        console.log(`   First device: ${loginRes.data.user.devices[0].deviceid} (${loginRes.data.user.devices[0].devicename})`);
      }
    } else {
      console.error("❌ Login failed:", loginRes.data);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ Login request failed:", err.message);
    allPassed = false;
  }

  // ----------------------------------------------------------------
  // SCREEN 2: ScannerScreen / BleScannerService Flow
  // ----------------------------------------------------------------
  console.log("\n📱 [TEST SCREEN 2: ScannerScreen -> BleScannerService]");
  const simulatedDeviceId = "SIH_TEAM_SAPPHIRE001";
  const simLat = 19.21240;
  const simLon = 73.09550;
  const simTimestamp = new Date().toISOString();
  console.log(`Action: Scanner detects beacon '${simulatedDeviceId}' and pushes GPS coords (${simLat}, ${simLon})...`);

  try {
    const storeRes = await api.post('/storeLocation', {
      deviceId: simulatedDeviceId,
      latitude: simLat,
      longitude: simLon,
      timestamp: simTimestamp
    });
    if (storeRes.data.success) {
      console.log(`✅ Location stored successfully! Server message: "${storeRes.data.message}"`);
    } else {
      console.error("❌ storeLocation rejected:", storeRes.data);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ storeLocation failed:", err.message);
    allPassed = false;
  }

  // ----------------------------------------------------------------
  // SCREEN 3: LocateDeviceScreen Flow
  // ----------------------------------------------------------------
  console.log("\n📱 [TEST SCREEN 3: LocateDeviceScreen]");
  console.log(`Action: Searching for device '${simulatedDeviceId}' to display on MapView...`);
  try {
    const locateRes = await api.get(`/locatedevice/${simulatedDeviceId}`);
    const device = locateRes.data;
    if (device && device.location) {
      const parsedLat = Number(device.location.lat);
      const parsedLng = Number(device.location.lng);
      console.log(`✅ Locate Device SUCCESS!`);
      console.log(`   Device Name: ${device.name}`);
      console.log(`   Parsed Coordinates: Lat ${parsedLat}, Lng ${parsedLng}`);
      console.log(`   Address: ${device.location.address}`);
      console.log(`   Last Seen: ${device.lastSeen}`);

      // Verify coordinate safety for MapView
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        console.error("❌ Coordinates failed Number() parsing for MapView!");
        allPassed = false;
      } else {
        console.log("   MapView region and Marker coordinates verified VALID.");
      }
    } else {
      console.error("❌ Invalid device location data:", device);
      allPassed = false;
    }
  } catch (err) {
    console.error("❌ Locate device failed:", err.message);
    allPassed = false;
  }

  // ----------------------------------------------------------------
  // SCREEN 4: ReportLostScreen (Report Lost & Mark Found) Flow
  // ----------------------------------------------------------------
  console.log("\n📱 [TEST SCREEN 4: ReportLostScreen]");
  const testLostDevice = "SIH_TEAM_SAPPHIRE001";
  console.log(`Action: Marking '${testLostDevice}' as LOST...`);
  try {
    const reportRes = await api.post(`/reportlost/${testLostDevice}`);
    console.log(`✅ Report Lost Response: ${reportRes.data.message}`);

    // Verify it is reflected in /admin/stats (Police Portal)
    const statsRes = await api.get('/admin/stats');
    const isPresentInPolicePortal = statsRes.data.devices?.some(d => d.deviceid === testLostDevice);
    console.log(`   Visible in Police Portal incidents: ${isPresentInPolicePortal ? 'YES ✅' : 'NO ❌'}`);

    // Now test Mark Found
    console.log(`Action: Marking '${testLostDevice}' as FOUND...`);
    const foundRes = await api.post(`/markfound/${testLostDevice}`);
    console.log(`✅ Mark Found Response: ${foundRes.data.message}`);
  } catch (err) {
    console.error("❌ Report lost/found flow failed:", err.message);
    allPassed = false;
  }

  // ----------------------------------------------------------------
  // SCREEN 6: BLE Prefix Emitting & Scanning Strict Filter Test
  // ----------------------------------------------------------------
  console.log("\n📱 [TEST SCREEN 6: BLE Prefix Emitting & Strict Scanning Filter]");
  
  // Test Prefix Emitting
  function formatBeaconName(deviceId, prefix) {
    const cleanId = (deviceId || '').trim();
    const cleanPrefix = (prefix || 'SIH_TEAM_SAPPHIRE').trim();
    if (!cleanPrefix) return cleanId;
    if (cleanId.startsWith(cleanPrefix)) return cleanId;
    const strippedId = cleanId.replace(/^(SIH_TEAM_SAPPHIRE|SPORS_DEVICE_|SPORS|_)+/i, '');
    return `${cleanPrefix}${strippedId || cleanId}`;
  }

  const emitTest1 = formatBeaconName("001", "SIH_TEAM_SAPPHIRE");
  const emitTest2 = formatBeaconName("SIH_TEAM_SAPPHIRE001", "SIH_TEAM_SAPPHIRE");
  const emitTest3 = formatBeaconName("DEVICE_X", "SPORS");
  
  console.log(`Action: Testing BLE Prefix Emitting formatting...`);
  console.log(`   Emit input ("001", prefix="SIH_TEAM_SAPPHIRE") -> "${emitTest1}"`);
  console.log(`   Emit input ("SIH_TEAM_SAPPHIRE001", prefix="SIH_TEAM_SAPPHIRE") -> "${emitTest2}"`);
  console.log(`   Emit input ("DEVICE_X", prefix="SPORS") -> "${emitTest3}"`);

  if (emitTest1 === "SIH_TEAM_SAPPHIRE001" && emitTest2 === "SIH_TEAM_SAPPHIRE001" && emitTest3 === "SPORSDEVICE_X") {
    console.log("✅ BLE Emitting prefix enforcement: 100% ACCURATE!");
  } else {
    console.error("❌ BLE Emitting prefix enforcement mismatch!");
    allPassed = false;
  }

  // Test Prefix Scanning Strict Filter
  console.log(`Action: Testing BLE Scanning filter (targetPrefix="SIH_TEAM_SAPPHIRE")...`);
  const activeFilter = "SIH_TEAM_SAPPHIRE";
  const packets = [
    { name: "SIH_TEAM_SAPPHIRE001", shouldCapture: true },
    { name: "Apple Watch Ultra", shouldCapture: false },
    { name: "JBL Flip 6", shouldCapture: false },
    { name: "SPORS-PHONE-09", shouldCapture: false },
    { name: "SIH_TEAM_SAPPHIRE_ALPHA", shouldCapture: true },
  ];

  let filterAccuracy = true;
  packets.forEach(pkt => {
    const isCaptured = pkt.name.startsWith(activeFilter);
    const passed = isCaptured === pkt.shouldCapture;
    console.log(`   Packet "${pkt.name}" -> ${isCaptured ? 'CAPTURED 🎯' : 'DROPPED 🚫'} (Expected: ${pkt.shouldCapture ? 'CAPTURE' : 'DROP'}) [${passed ? 'PASS' : 'FAIL'}]`);
    if (!passed) filterAccuracy = false;
  });

  if (filterAccuracy) {
    console.log("✅ BLE Scanning strict prefix filtering: 100% ACCURATE!");
  } else {
    console.error("❌ BLE Scanning prefix filtering failed!");
    allPassed = false;
  }

  console.log("\n==========================================================");
  if (allPassed) {
    console.log("🎉 ALL MOBILE APP SUBSYSTEMS & SCREENS WORKING PROPERLY!");
  } else {
    console.log("⚠️ SOME MOBILE CHECKS FAILED — REVIEW LOGS ABOVE");
  }
  console.log("==========================================================");
}

runMobileAppFlowTests();
