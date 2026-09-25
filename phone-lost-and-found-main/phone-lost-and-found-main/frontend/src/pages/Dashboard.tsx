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

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ count: 0, devices: [] });
  const [chatSearch, setChatSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  
  // Police registration state
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
      if (data.success) {
        setStats({ count: data.count, devices: data.devices });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChats = async (search: string) => {
    try {
      const res = await fetchWithFallback(`/admin/chats?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setChats(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterPolice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithFallback("/admin/register-police", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: policeUsername, password: policePassword })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Police account registered!");
        setPoliceUsername("");
        setPolicePassword("");
      } else {
        toast.error(data.error || "Failed to register");
      }
    } catch (e) {
      toast.error("Error connecting to server");
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "police")) {
    return <div className="p-8 text-center">Access Denied</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">
        {user.role === "admin" ? "Admin Dashboard" : "Police Dashboard"}
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.count} Devices Reported Lost</p>
          </CardContent>
        </Card>

        {user.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Register Police Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterPolice} className="space-y-4">
                <Input 
                  placeholder="Police Username" 
                  value={policeUsername} 
                  onChange={(e) => setPoliceUsername(e.target.value)} 
                  required 
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={policePassword} 
                  onChange={(e) => setPolicePassword(e.target.value)} 
                  required 
                />
                <Button type="submit">Register Police</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Lost Devices Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] rounded overflow-hidden">
            {stats.devices.length > 0 ? (
              <Map 
                latitude={parseFloat(stats.devices[0].lat) || 0} 
                longitude={parseFloat(stats.devices[0].lon) || 0} 
                deviceName="Multiple Devices"
                // Assuming Map component handles a single pin or center. 
                // We'd ideally pass markers array to Map, but for now we render it.
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted">No lost devices to display</div>
            )}
            <div className="mt-4 text-sm text-muted-foreground overflow-auto h-32">
              <p className="font-bold mb-2">Lost Device Coordinates:</p>
              {stats.devices.map((d: any) => (
                <div key={d.deviceid}>
                  {d.devicename} ({d.username}): Lat {d.lat}, Lon {d.lon}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitor Active Chats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input 
              placeholder="Search by username..." 
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
            />
            <Button onClick={() => fetchChats(chatSearch)}>Search</Button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chats.length === 0 && <p className="text-muted-foreground">No active chat sessions found.</p>}
            {chats.map((session: any) => (
              <div key={session.session_id} className="p-4 border rounded flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-muted/50">
                <div className="break-all">
                  <h4 className="font-bold">{session.devicename || session.deviceid}</h4>
                  <p className="text-sm text-muted-foreground">Device ID: {session.deviceid}</p>
                  <p className="text-sm text-muted-foreground">Session: {session.session_id}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Messages: {session.message_count} | Last active: {new Date(session.last_activity).toLocaleString()}
                  </p>
                </div>
                <Button className="w-full sm:w-auto shrink-0" onClick={() => setSelectedChat(session)}>Join Chat</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
        <DialogContent className="sm:max-w-2xl p-0">
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
