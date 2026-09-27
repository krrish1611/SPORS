import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchWithFallback } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Map from "@/components/Map";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnonymousChat } from "@/components/AnonymousChat";
import { Shield, MapPin, Building2, Search, Radio, CheckCircle, AlertTriangle, Users, Lock, Sparkles, Activity, Terminal } from "lucide-react";
import { playUiClick, playCyberAlert } from "@/lib/sound";

export default function Dashboard() {
  const { user } = useAuth();
  const [demoMode, setDemoMode] = useState(false);
  const [stats, setStats] = useState({ 
    count: 3, 
    devices: [
      { deviceid: "SPORS-PHONE-Alpha", devicename: "Google Pixel 8 Pro", username: "citizen_alex", lat: 28.6139, lon: 77.2090 },
      { deviceid: "SIH-PROJECT-COBRA", devicename: "Samsung Galaxy S24", username: "rahul_k", lat: 28.6180, lon: 77.2140 },
      { deviceid: "RECOVERED-HANDSET-08", devicename: "iPhone 15 Black", username: "priya_s", lat: 28.6110, lon: 77.2050 },
    ] 
  });
  const [chatSearch, setChatSearch] = useState("");
  const [chats, setChats] = useState<any[]>([
    {
      session_id: "SESSION_SPORS_01",
      deviceid: "SPORS-PHONE-Alpha",
      devicename: "Google Pixel 8 Pro",
      message_count: 6,
      last_activity: new Date().toISOString()
    }
  ]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [policeUsername, setPoliceUsername] = useState("");
  const [policePassword, setPolicePassword] = useState("");

  useEffect(() => {
    fetchStats();
    fetchChats("");
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetchWithFallback("/admin/stats");
      const data = await res.json();
      if (data.success && data.devices?.length) {
        setStats({ count: data.count, devices: data.devices });
        // Set first device with coordinates as selected
        const withCoords = data.devices.find((d: any) => d.lat && d.lon);
        if (withCoords) {
          setSelectedIncident(withCoords);
        } else {
          setSelectedIncident(data.devices[0]);
        }
      }
    } catch (e) {
      // Offline fallback
    }
  };

  const fetchChats = async (search: string) => {
    try {
      const res = await fetchWithFallback(`/admin/chats?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && data.sessions?.length) {
        setChats(data.sessions || []);
      }
    } catch (e) {
      // Offline fallback
    }
  };

  const handleRegisterPolice = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    try {
      const res = await fetchWithFallback("/admin/register-police", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: policeUsername, password: policePassword })
      });
      const data = await res.json();
      if (data.success) {
        playCyberAlert();
        toast.success("Police station credential provisioned!");
        setPoliceUsername("");
        setPolicePassword("");
      } else {
        toast.error(data.error || "Failed to register station terminal");
      }
    } catch (e) {
      playCyberAlert();
      toast.success(`[DEMO] Official badge provisioned for Officer: ${policeUsername}`);
      setPoliceUsername("");
      setPolicePassword("");
    }
  };

  const isOfficer = user && (user.role === "admin" || user.role === "police");

  if (!isOfficer && !demoMode) {
    return (
      <div className="min-h-[85vh] py-16 px-4 flex items-center justify-center font-tech">
        <div className="max-w-md w-full cyber-glass cyber-corner p-6 sm:p-8 text-center rounded-2xl relative shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
            Restricted Station Desk
          </div>
          <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 cyber-neon-glow">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-tech uppercase tracking-wider text-foreground mb-2">
            Police Command Terminal
          </h2>
          <p className="text-xs text-muted-foreground font-sans leading-relaxed mb-6">
            Authorized portal for law enforcement officers to track active missing smartphone cases, 
            verify custody drop-offs, and inspect anonymous recovery sessions.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => {
                playUiClick();
                setDemoMode(true);
              }}
              className="w-full font-bold uppercase tracking-wider rounded-lg h-11 text-xs cyber-glow"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Preview Officer Command Portal
            </Button>
            <p className="text-[11px] text-muted-foreground">
              Evaluators can preview the police portal without entering official station credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28 py-8 space-y-8 font-tech relative z-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl cyber-mecha-card cyber-corner border border-primary/30 gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-cyber-glow-sm cyber-chamfer">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-foreground">
                {user?.role === "admin" ? "Central Admin Command Desk" : "Police Station Command Portal"}
              </h1>
              <span className="text-[11px] text-primary font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25">
                {user?.role === "admin" ? "Root Admin Desk" : "Station DEL-HQ-04"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Decentralized Bluetooth Mesh Tracking & Stolen Handset Recovery Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Station Feed Active
          </span>
        </div>
      </div>

      {/* Colorful Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="cyber-mecha-card cyber-corner border-rose-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Reported Missing</span>
              </span>
              <span className="font-mono text-[10px] text-rose-500/80">[ALERT]</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold font-tech text-rose-600 dark:text-rose-400">{stats.count}</p>
            <span className="text-xs text-muted-foreground font-sans">Active Lost Handset Beacons</span>
          </CardContent>
        </Card>

        <Card className="cyber-mecha-card cyber-corner border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Station Drop-Offs</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-500/80">[SECURED]</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold font-tech text-emerald-600 dark:text-emerald-400">12</p>
            <span className="text-xs text-muted-foreground font-sans">Secured in Police Station Custody</span>
          </CardContent>
        </Card>

        <Card className="cyber-mecha-card cyber-corner border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary" />
                <span>Community Relays</span>
              </span>
              <span className="font-mono text-[10px] text-primary/80">[BLE_MESH]</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold font-tech text-primary">14,280+</p>
            <span className="text-xs text-muted-foreground font-sans">Active Citizen Volunteer Nodes</span>
          </CardContent>
        </Card>
      </div>

      {/* Map & Coordinates */}
      <Card className="cyber-mecha-card cyber-corner border-primary/30 overflow-hidden">
        <CardHeader className="border-b border-border/60 py-3.5 px-6 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Police Incident Map — Reported Devices
            </CardTitle>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {stats.devices.length} INCIDENTS_PINNED
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[380px] w-full">
            {stats.devices.length > 0 ? (
              <Map 
                latitude={
                  selectedIncident && selectedIncident.lat 
                    ? (parseFloat(String(selectedIncident.lat)) || 28.6139) 
                    : (stats.devices.find((d: any) => d.lat && d.lon)?.lat ? parseFloat(String(stats.devices.find((d: any) => d.lat && d.lon).lat)) : 28.6139)
                } 
                longitude={
                  selectedIncident && selectedIncident.lon 
                    ? (parseFloat(String(selectedIncident.lon)) || 77.2090) 
                    : (stats.devices.find((d: any) => d.lat && d.lon)?.lon ? parseFloat(String(stats.devices.find((d: any) => d.lat && d.lon).lon)) : 77.2090)
                } 
                deviceName={selectedIncident?.devicename || "Active Incident"}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-secondary/30 text-xs text-muted-foreground">
                No active incident signals in sector
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-border bg-secondary/30 max-h-48 overflow-y-auto space-y-2 text-xs">
            <span className="font-semibold text-foreground block mb-1 text-xs">
              Active Coordinate Pings (Click to focus map):
            </span>
            {stats.devices.map((d: any) => {
              const isSelected = selectedIncident?.deviceid === d.deviceid;
              return (
                <div 
                  key={d.deviceid} 
                  onClick={() => setSelectedIncident(d)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border gap-1 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-primary/15 border-primary shadow-sm' 
                      : 'bg-card/80 border-border/60 hover:border-primary/50'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-foreground">{d.devicename || d.deviceid}</span>
                    <span className="text-primary ml-2 font-mono text-[11px]">[{d.deviceid}]</span>
                    {isSelected && (
                      <span className="ml-2 text-[10px] uppercase font-bold text-primary px-1.5 py-0.2 rounded bg-primary/20">Active Focus</span>
                    )}
                  </div>
                  <div className="text-muted-foreground font-mono text-[11px]">
                    {d.lat && d.lon ? (
                      <span>GPS: {parseFloat(String(d.lat)).toFixed(4)}° N, {parseFloat(String(d.lon)).toFixed(4)}° E</span>
                    ) : (
                      <span className="text-amber-500 font-medium">Coordinates Pending (Mesh Ping Expected)</span>
                    )}
                    {" • "}Owner: <span className="text-foreground">{d.username || "anonymous"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Monitor Return Sessions */}
      <Card className="cyber-glass cyber-corner">
        <CardHeader className="border-b border-border/60 py-3.5 px-6">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Audited Anonymous Device Recovery Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input 
              placeholder="Search by device ID or username..." 
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="h-10 text-xs font-tech bg-background"
            />
            <Button 
              onClick={() => {
                playUiClick();
                fetchChats(chatSearch);
              }}
              size="sm"
              className="h-10 px-4 text-xs font-bold uppercase tracking-wider cyber-glow"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Search Sessions
            </Button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {chats.length === 0 && (
              <p className="text-xs text-muted-foreground p-4 text-center">
                No active recovery sessions found.
              </p>
            )}
            {chats.map((session: any) => (
              <div 
                key={session.session_id} 
                className="p-3.5 border border-border/80 rounded-xl flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-card/60 hover:border-primary/50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">{session.devicename || session.deviceid}</h4>
                  <p className="text-xs text-primary font-mono">Device ID: {session.deviceid}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                    Messages: {session.message_count || 3} • Active: {new Date(session.last_activity).toLocaleTimeString()}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="w-full sm:w-auto text-xs uppercase font-bold tracking-wider" 
                  onClick={() => {
                    playUiClick();
                    setSelectedChat(session);
                  }}
                >
                  Inspect Case Chat
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Registration Form */}
      {(user?.role === "admin" || demoMode) && (
        <Card className="cyber-glass cyber-corner">
          <CardHeader className="border-b border-border/60 py-3.5 px-6">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Issue New Police Station Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegisterPolice} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <Label className="text-xs uppercase font-semibold">Officer Username / Station Code</Label>
                <Input 
                  placeholder="e.g. Officer_Sharma_Station_04" 
                  value={policeUsername} 
                  onChange={(e) => setPoliceUsername(e.target.value)} 
                  required 
                  className="h-10 text-xs font-tech bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase font-semibold">Terminal Password</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={policePassword} 
                  onChange={(e) => setPolicePassword(e.target.value)} 
                  required 
                  className="h-10 text-xs font-tech bg-background"
                />
              </div>
              <Button type="submit" size="sm" className="text-xs font-bold uppercase tracking-wider cyber-glow">
                Provision Station Terminal
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Dialog for Anonymous Chat Inspection */}
      <Dialog open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
        <DialogContent className="sm:max-w-2xl p-0 rounded-2xl overflow-hidden bg-card border-2 border-primary/40">
          <DialogHeader className="p-4 pb-0 border-b hidden">
            <DialogTitle>Chat Monitor</DialogTitle>
          </DialogHeader>
          {selectedChat && (
            <AnonymousChat 
              deviceId={selectedChat.deviceid} 
              deviceName={selectedChat.devicename || selectedChat.deviceid} 
              sessionId={selectedChat.session_id}
              onClose={() => setSelectedChat(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

