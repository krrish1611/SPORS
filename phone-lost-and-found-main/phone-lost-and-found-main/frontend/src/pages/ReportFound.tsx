import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, Play, Square, Wifi, Shield } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { fetchWithFallback } from "@/lib/api";


interface ScanResult {
  deviceId: string;
  timestamp: string;
  lat: number;
  lon: number;
}

const ReportFound = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanRef, setScanRef] = useState<any>(null);

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
      console.log(`✅ Sent location for ${data.deviceId}`);
    } catch (err) {
      console.error("❌ Failed to send location:", err);
    }
  };

  const handleScanToggle = async () => {
    if (!isScanning) {
      try {
        if (!(navigator as any).bluetooth?.requestLEScan) {
          toast.error("Bluetooth LE scanning not supported");
          return;
        }

        (navigator as any).bluetooth.addEventListener(
          "advertisementreceived",
          (event: any) => {
            if (!event.device?.name?.startsWith("SIH_TEAM_SAPPHIRE")) return;

            const now = new Date().toISOString();

            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const { latitude, longitude } = pos.coords;
                const foundDevice: ScanResult = {
                  deviceId: event.device.name,
                  timestamp: now,
                  lat: latitude,
                  lon: longitude,
                };

                setScanResults((prev) => [foundDevice, ...prev.slice(0, 4)]);
                toast.success(`🎯 Found ${event.device.name}`);

                // Send to backend
                sendLocationToBackend(foundDevice);
              },
              (err) => console.error("❌ GPS error:", err),
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
        toast.success("✅ Bluetooth scanning started");
      } catch (err) {
        console.error("❌ Scan failed:", err);
        toast.error("Permission denied or scan failed");
        setIsScanning(false);
      }
    } else {
      scanRef?.stop?.();
      setScanRef(null);
      setIsScanning(false);
      toast.info("🛑 Stopped scanning");
    }
  };





  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Radar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Help Find a Device
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Help others by turning your device into a scanner. If you find a lost device, 
              its location will be anonymously reported to the owner.
            </p>
          </div>

          {/* Scan Control */}
          <Card className="shadow-elegant border-0 mb-8">
            <CardHeader>
              <CardTitle className="text-center text-xl">Network Scanner</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <Button
                onClick={handleScanToggle}
                variant={isScanning ? "scan-active" : "scan"}
                size="lg"
                className="w-full h-16 text-lg mb-6"
              >
                {isScanning ? (
                  <>
                    <Square className="w-6 h-6 mr-3" />
                    Stop Scanning
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    Start Scanning
                  </>
                )}
              </Button>

              {/* Status */}
              <div className="p-4 rounded-lg bg-muted/30">
                {isScanning ? (
                  <div className="flex items-center justify-center text-accent">
                    <div className="animate-pulse w-3 h-3 bg-accent rounded-full mr-3"></div>
                    <span className="font-medium">Scanning for Bluetooth devices nearby...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Wifi className="w-5 h-5 mr-3" />
                    <span>Your device is not currently scanning</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scan Results */}
          {scanResults.length > 0 && (
            <Card className="shadow-elegant border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Recent Detections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {scanResults.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-accent/10 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                          <Radar className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{result.deviceId}</p>
                          <p className="text-xs text-muted-foreground">
                            Lat: {result.lat.toFixed(5)}, Lon: {result.lon.toFixed(5)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Info */}
          <Card className="bg-muted/30 border-0">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Privacy Protected</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    All scanning is completely anonymous. Device locations are encrypted and 
                    only shared with verified owners. Your personal information is never collected or stored.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportFound;
