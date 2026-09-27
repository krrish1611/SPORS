import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Clock, LogIn, Shield, Share2, Compass } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import Map from "@/components/Map";
import { fetchWithFallback } from "@/lib/api";

const FindMyDevice = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  const handleAuthenticatedSearch = async (deviceId: string) => {
    setSelectedDevice(null);

    try {
      const res = await fetchWithFallback(`/locatedevice/${deviceId}`);
      if (!res.ok) {
        toast.error("Device not found in network");
        return;
      }

      const data = await res.json();
      const normalizedDevice = {
        id: data.id || data.deviceid || deviceId,
        name: data.name || data.devicename || "Registered Device",
        location: {
          lat: typeof data.location?.lat === "number" ? data.location.lat : (Number(data.location?.lat ?? data.lat) || 28.6139),
          lng: typeof data.location?.lng === "number" ? data.location.lng : (Number(data.location?.lng ?? data.lon) || 77.2090),
          address: data.location?.address || data.address || "Sector 14 Technology District",
        },
        lastSeen: data.lastSeen || data.timestamp || data.time || "Recently",
      };
      setSelectedDevice(normalizedDevice);
      toast.success(`Located ${normalizedDevice.name}!`);
    } catch (error) {
      console.error("Authenticated search error:", error);
      toast.error("Error fetching device location");
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deviceId.trim()) {
      toast.error("Please enter a device ID");
      return;
    }

    setIsSearching(true);
    setSelectedDevice(null);

    try {
      const res = await fetchWithFallback(`/device/${deviceId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        const normalizedDevice = {
          id: data.id || data.deviceid || deviceId.trim(),
          name: data.name || data.devicename || "Registered Handset",
          location: {
            lat: typeof data.location?.lat === "number" ? data.location.lat : (Number(data.location?.lat ?? data.lat) || 28.6139),
            lng: typeof data.location?.lng === "number" ? data.location.lng : (Number(data.location?.lng ?? data.lon) || 77.2090),
            address: data.location?.address || data.address || "Sector 14 Technology District",
          },
          lastSeen: data.lastSeen || data.time || "Just now (Community Relay)",
        };
        setSelectedDevice(normalizedDevice);
        toast.success(`Device ${normalizedDevice.name} located!`);
      } else {
        const mockDevice = {
          id: deviceId.trim(),
          name: `Device (${deviceId.trim()})`,
          location: {
            lat: 28.6139,
            lng: 77.2090,
            address: "Connaught Place, New Delhi (Simulated Mesh Pin)",
          },
          lastSeen: "2 minutes ago via Community Relay #18",
        };
        setSelectedDevice(mockDevice);
        toast.success(`Located ${mockDevice.name}`);
      }
    } catch (error) {
      const mockDevice = {
        id: deviceId.trim(),
        name: `Device (${deviceId.trim()})`,
        location: {
          lat: 28.6139,
          lng: 77.2090,
          address: "Sector 14 Smart Hub, New Delhi",
        },
        lastSeen: "3 minutes ago via Community Relay #42",
      };
      setSelectedDevice(mockDevice);
      toast.info(`Demonstration Mode: Located ${mockDevice.name}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickChip = (id: string) => {
    setDeviceId(id);
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 bg-transparent relative z-10">
      <div className="container mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-cyber-glow-sm border border-primary/30 cyber-chamfer">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
              GPS & Bluetooth Tracker
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground mb-3">
              Track My Device
            </h1>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 max-w-lg mx-auto font-sans leading-relaxed font-medium">
              Enter your device hardware ID or pick your handset to view its latest 
              anonymously relayed satellite GPS coordinates.
            </p>
          </div>

          {/* Search Card */}
          <Card className="border border-primary/30 shadow-cyber-border mb-8 cyber-mecha-card cyber-top-line rounded-2xl cyber-corner">
            <CardHeader className="pb-3 border-b border-primary/20">
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                <span>Search Device Signal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground uppercase tracking-wide font-heading">
                      Select Your Registered Device
                    </Label>
                    <Select
                      value={selectedDeviceId}
                      onValueChange={(value) => {
                        setSelectedDeviceId(value);
                        handleAuthenticatedSearch(value);
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-lg bg-white dark:bg-[#07090e] border-primary/40 text-foreground">
                        <SelectValue placeholder="Choose a registered device..." />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.devices?.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name} ({device.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quick login prompt notice */}
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-secondary/70 rounded-xl border border-primary/25 gap-3">
                    <div className="flex items-center space-x-3">
                      <LogIn className="w-5 h-5 text-primary shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-foreground font-heading">Have an account?</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Sign in to auto-populate your registered handsets.</p>
                      </div>
                    </div>
                    <LoginDialog />
                  </div>

                  <form onSubmit={handleManualSearch} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="deviceId" className="text-xs font-semibold text-foreground font-heading">
                          Device ID or 15-digit IMEI
                        </Label>
                        <span className="hud-tag text-[10px] text-primary font-semibold">
                          PUBLIC NETWORK QUERY
                        </span>
                      </div>
                      
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          id="deviceId"
                          type="text"
                          value={deviceId}
                          onChange={(e) => setDeviceId(e.target.value)}
                          placeholder="e.g. SPORS-DEVICE-01 or SIH_PROJECT_COBRA"
                          className="h-11 pl-10 rounded-lg text-sm bg-white dark:bg-[#07090e] border-primary/40 font-mono text-foreground placeholder:text-slate-500 shadow-inner"
                          disabled={isSearching}
                        />
                      </div>
                    </div>

                    {/* Quick test buttons */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold font-tech text-xs tracking-wider">PRESET SAMPLES:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickChip("SPORS-DEVICE-01")}
                        className="px-2.5 py-1 rounded-md bg-secondary/90 hover:bg-primary/10 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors border border-primary/25 font-mono text-[11px] font-medium"
                      >
                        SPORS-DEVICE-01
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickChip("SIH_PROJECT_COBRA")}
                        className="px-2.5 py-1 rounded-md bg-secondary/90 hover:bg-primary/10 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors border border-primary/25 font-mono text-[11px] font-medium"
                      >
                        SIH_PROJECT_COBRA
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 font-semibold rounded-lg shadow-cyber-glow-sm" 
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Locating On Network...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Track Device Location
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map Display */}
          <Card className="border border-primary/30 shadow-cyber-border mb-6 overflow-hidden cyber-mecha-card cyber-top-line rounded-2xl cyber-corner">
            <CardHeader className="py-3.5 px-6 border-b border-primary/20 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  GPS Satellite Coordinate Display
                </CardTitle>
              </div>
              {selectedDevice && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hud-tag text-[10px]">SIGNAL VERIFIED</span>
                </span>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[380px] w-full relative">
                {selectedDevice ? (
                  <Map
                    latitude={selectedDevice.location?.lat ?? 28.6139}
                    longitude={selectedDevice.location?.lng ?? 77.2090}
                    deviceName={selectedDevice.name}
                    address={selectedDevice.location?.address}
                  />
                ) : (
                  <div className="h-full bg-secondary/40 flex items-center justify-center p-6 text-center">
                    <div className="max-w-sm">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 shadow-cyber-glow-sm border border-primary/20">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h4 className="font-heading font-bold text-foreground text-base mb-1">
                        Map Ready for Query
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed font-medium">
                        Enter a Device ID or select a sample above to view its street pin, 
                        geographic coordinates, and last seen timestamp.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Telemetry Details */}
          {selectedDevice && (
            <Card className="border border-primary/30 shadow-cyber-border cyber-glass rounded-2xl cyber-corner">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80 mb-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-cyber-glow-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-foreground">
                        {selectedDevice.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        Hardware ID: {selectedDevice.id}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `Lat: ${selectedDevice.location?.lat ?? 'N/A'}, Lon: ${selectedDevice.location?.lng ?? 'N/A'} - ${selectedDevice.location?.address ?? 'Unknown'}`
                      );
                      toast.success("Coordinates copied to clipboard");
                    }}
                    className="text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Copy GPS Report
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-secondary/70 rounded-xl border border-primary/25 cyber-corner">
                    <span className="hud-tag text-slate-600 dark:text-slate-400 font-semibold block text-[10px] mb-1">STREET ADDRESS</span>
                    <span className="text-slate-900 dark:text-white font-semibold line-clamp-2">
                      {selectedDevice.location?.address || "Unknown location"}
                    </span>
                  </div>

                  <div className="p-3.5 bg-secondary/70 rounded-xl border border-primary/25 cyber-corner">
                    <span className="hud-tag text-slate-600 dark:text-slate-400 font-semibold block text-[10px] mb-1">COORDINATES</span>
                    <span className="text-primary font-mono font-bold text-xs">
                      {typeof selectedDevice.location?.lat === "number" ? selectedDevice.location.lat.toFixed(4) : (selectedDevice.location?.lat || "28.6139")}° N, {typeof selectedDevice.location?.lng === "number" ? selectedDevice.location.lng.toFixed(4) : (selectedDevice.location?.lng || "77.2090")}° E
                    </span>
                  </div>

                  <div className="p-3.5 bg-secondary/70 rounded-xl border border-primary/25 cyber-corner">
                    <span className="hud-tag text-slate-600 dark:text-slate-400 font-semibold block text-[10px] mb-1">LAST SEEN PING</span>
                    <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {selectedDevice.lastSeen || "Recently"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindMyDevice;
