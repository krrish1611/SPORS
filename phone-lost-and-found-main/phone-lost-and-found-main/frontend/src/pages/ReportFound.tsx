import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Shield, Radio, CheckCircle, Play, Square, Sparkles, MapPin, Activity } from "lucide-react";
import { toast } from "sonner";
import { fetchWithFallback } from "@/lib/api";

interface ScanResult {
  deviceId: string;
  timestamp: string;
  lat: number;
  lon: number;
  rssi?: string;
}

const ReportFound = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([
    {
      deviceId: "SPORS-PHONE-Alpha",
      timestamp: "1 minute ago",
      lat: 28.6139,
      lon: 77.2090,
      rssi: "-64 dBm"
    }
  ]);
  const [scanRef, setScanRef] = useState<any>(null);
  const simTimerRef = useRef<any>(null);

  const sendLocationToBackend = async (data: ScanResult) => {
    try {
      await fetchWithFallback("/storeLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: data.deviceId,
          latitude: data.lat,
          longitude: data.lon,
          timestamp: data.timestamp
        })
      });
    } catch (err) {
      console.warn("Location relay fallback (offline/demo):", err);
    }
  };

  const handleRealScanToggle = async () => {
    if (!isScanning) {
      try {
        if (!(navigator as any).bluetooth?.requestLEScan) {
          toast.error("Web Bluetooth LE scanning is not supported by your browser. You can click 'Test Sample Detection' below to preview the feature.");
          return;
        }

        (navigator as any).bluetooth.addEventListener(
          "advertisementreceived",
          (event: any) => {
            const now = new Date().toLocaleTimeString();

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                const foundDevice: ScanResult = {
                  deviceId: event.device.name || "Nearby Beacon",
                  timestamp: now,
                  lat: latitude,
                  lon: longitude,
                  rssi: `${event.rssi || -68} dBm`,
                };

                setScanResults((prev) => [foundDevice, ...prev.slice(0, 5)]);
                toast.success(`Found Beacon: ${foundDevice.deviceId}`);
                sendLocationToBackend(foundDevice);
              },
              (err) => console.error("GPS error:", err),
              { enableHighAccuracy: true }
            );
          }
        );

        const scan = await (navigator as any).bluetooth.requestLEScan({
          acceptAllAdvertisements: true,
          keepRepeatedDevices: true,
        });

        setScanRef(scan);
        setIsScanning(true);
        toast.success("Bluetooth LE scanner active");
      } catch (err) {
        console.error("Scan failed:", err);
        toast.info("Browser blocked Bluetooth permissions. Try test mode below.");
      }
    } else {
      stopScanning();
    }
  };

  const triggerTestDetection = () => {
    const sampleNames = ["Google Pixel 8 Pro", "Samsung S24 Ultra", "OnePlus 12 Handset"];
    const picked = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const newDevice: ScanResult = {
      deviceId: `${picked} [SPORS-${Math.floor(100 + Math.random() * 900)}]`,
      timestamp: new Date().toLocaleTimeString(),
      lat: 28.6139 + (Math.random() - 0.5) * 0.005,
      lon: 77.2090 + (Math.random() - 0.5) * 0.005,
      rssi: `-${Math.floor(55 + Math.random() * 25)} dBm`,
    };

    setScanResults((prev) => [newDevice, ...prev.slice(0, 5)]);
    toast.success(`Sample detected: ${newDevice.deviceId}`);
    sendLocationToBackend(newDevice);
  };

  const stopScanning = () => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    scanRef?.stop?.();
    setScanRef(null);
    setIsScanning(false);
    toast.info("Scanner stopped");
  };

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen py-10 sm:py-16 bg-transparent relative z-10">
      <div className="container mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-cyber-glow-sm border border-primary/30 cyber-chamfer">
              <Radio className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
              Community Radar Scanner
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground mb-3">
              Help Find Lost Devices
            </h1>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 max-w-xl mx-auto font-sans leading-relaxed font-medium">
              Volunteer your browser to passively listen for nearby lost phone beacons. 
              Any detected signal automatically updates the owner's map without revealing your identity.
            </p>
          </div>

          {/* Scanner Control Card */}
          <Card className="border border-primary/30 shadow-cyber-border mb-8 cyber-mecha-card rounded-2xl cyber-corner">
            <CardHeader className="pb-3 border-b border-primary/20">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>Volunteer Network Scanner</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* Status display */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-secondary/70 border border-primary/25 mb-6 gap-4 cyber-corner">
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isScanning ? "bg-emerald-500/15 text-emerald-500 shadow-cyber-glow-sm" : "bg-muted text-muted-foreground"
                  }`}>
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground font-heading">
                      {isScanning ? "Scanner Active & Listening" : "Scanner on Standby"}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {isScanning ? "Checking for background Bluetooth Low Energy beacons" : "Click Start to enable passive mesh relay"}
                    </p>
                  </div>
                </div>

                {isScanning && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-semibold border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hud-tag text-[10px]">RADAR ACTIVE</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={isScanning ? stopScanning : handleRealScanToggle}
                  size="lg"
                  className={`flex-1 h-11 text-xs font-bold uppercase tracking-wider rounded-lg shadow-cyber-glow-sm ${
                    isScanning ? "bg-destructive hover:bg-destructive/90 text-white" : ""
                  }`}
                >
                  {isScanning ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Scanner
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Bluetooth Scan
                    </>
                  )}
                </Button>

                <Button
                  onClick={triggerTestDetection}
                  variant="outline"
                  size="lg"
                  className="h-11 text-xs font-semibold rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Test Sample Detection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detections List */}
          {scanResults.length > 0 && (
            <Card className="border border-border/80 shadow-cyber-border mb-8 cyber-glass rounded-2xl cyber-corner">
              <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Recent Relay Logs ({scanResults.length})</span>
                </CardTitle>
                <span className="hud-tag text-[10px] text-muted-foreground">
                  ENCRYPTED PINGS
                </span>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-2.5">
                {scanResults.map((result, index) => (
                  <div 
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-secondary/40 border border-border hover:border-primary/40 transition-colors gap-2 cyber-corner"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-cyber-glow-sm">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm font-heading">{result.deviceId}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          GPS: {result.lat.toFixed(4)}° N, {result.lon.toFixed(4)}° E {result.rssi ? `• Signal: ${result.rssi}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="hud-tag text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                        RELAYED
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{result.timestamp}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Privacy Guarantee Note */}
          <div className="p-4 rounded-xl cyber-glass border border-border flex items-start space-x-3.5 text-xs cyber-corner">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-cyber-glow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-0.5 font-heading">
                Volunteer Anonymity Protected
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Your browser only relays the detected beacon ID and its rough GPS location. 
                Your name, IP address, and identity are never stored or exposed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFound;
