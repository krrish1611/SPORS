import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MessageCircle, History, Shield, CheckCircle2, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AnonymousChat } from "@/components/AnonymousChat";
import { LoginDialog } from "@/components/LoginDialog";
import { fetchWithFallback } from "@/lib/api";

const ReportLostDevice = () => {
  const { user, isAuthenticated } = useAuth();
  const [deviceId, setDeviceId] = useState("");
  const [foundDevice, setFoundDevice] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  const [pastChats, setPastChats] = useState<Array<{
    deviceId: string;
    deviceName: string;
    sessionId: string;
    lastMessage: string;
    timestamp: string;
  }>>([]);

  const loadPastChats = async () => {
    if (!isAuthenticated || !user?.username) return;
    
    try {
      const res = await fetchWithFallback(`/my-chats?username=${encodeURIComponent(user.username)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const chats = data.sessions.map((s: any) => ({
            deviceId: s.deviceid,
            deviceName: s.devicename || s.deviceid,
            sessionId: s.session_id,
            lastMessage: s.last_message || 'No messages',
            timestamp: new Date(s.last_activity).toLocaleTimeString()
          }));
          setPastChats(chats);
        }
      }
    } catch (e) {
      console.warn("Could not load past chats from server");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.username) {
      loadPastChats();
    }
  }, [isAuthenticated, user?.username]);

  const handleDeviceSearch = async () => {
    if (!deviceId.trim()) {
      toast.error("Please enter a device ID");
      return;
    }

    try {
      const res = await fetchWithFallback(`/device/${deviceId.trim()}`);
      
      if (res.ok) {
        const device = await res.json();
        const sessionId = `${device.id}_${user?.username || 'volunteer'}`;
        setFoundDevice({ id: device.id, name: device.name || "Handset", sessionId });
        setShowChat(true);
        toast.success(`Device found! Opening chat...`);
      } else {
        // Demo fallback: open simulated chat session so user can test the chat interface
        const mockSessionId = `DEMO_${deviceId.trim()}`;
        setFoundDevice({ id: deviceId.trim(), name: `Found Phone (${deviceId.trim()})`, sessionId: mockSessionId });
        setShowChat(true);
        toast.info(`Demonstration Mode: Opening secure chat for ${deviceId.trim()}`);
      }
    } catch (e) {
      // Demo fallback
      const mockSessionId = `DEMO_${deviceId.trim()}`;
      setFoundDevice({ id: deviceId.trim(), name: `Found Phone (${deviceId.trim()})`, sessionId: mockSessionId });
      setShowChat(true);
      toast.info(`Demonstration Mode: Opening secure chat for ${deviceId.trim()}`);
    }
  };

  const openPastChat = (deviceId: string, deviceName: string, sessionId: string) => {
    setFoundDevice({ id: deviceId, name: deviceName, sessionId });
    setDeviceId(deviceId);
    setShowChat(true);
  };

  if (showChat && foundDevice) {
    return (
      <div className="min-h-screen py-10 sm:py-16 bg-transparent relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <AnonymousChat
              deviceId={foundDevice.id}
              deviceName={foundDevice.name}
              sessionId={foundDevice.sessionId}
              onClose={() => {
                setShowChat(false);
                setFoundDevice(null);
                setDeviceId("");
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 bg-transparent relative z-10">
      <div className="container mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-cyber-glow-sm border border-primary/30 cyber-chamfer">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
              Secure Citizen Relay
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground mb-3">
              Found a Lost Device
            </h1>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 max-w-xl mx-auto font-sans leading-relaxed font-medium">
              Found someone's missing phone? Enter the Device ID or IMEI displayed on the lock screen 
              to connect with the verified owner through an anonymous, safe chat.
            </p>
          </div>

          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-11 p-1 cyber-mecha-card border border-primary/30">
              <TabsTrigger value="report" className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                Look Up Found Handset
              </TabsTrigger>
              <TabsTrigger value="chats" onClick={loadPastChats} className="rounded-lg text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">
                Past Return Chats
              </TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="mt-6">
              <Card className="border border-primary/30 shadow-cyber-border cyber-mecha-card rounded-2xl cyber-corner">
                <CardHeader className="pb-3 border-b border-primary/20">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" />
                    <span>Enter Found Handset Identifier</span>
                    <span className="hud-tag text-[9px] text-primary ml-auto font-semibold">ANON CHAT</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="deviceId" className="text-xs font-semibold text-foreground">
                        Device ID or IMEI
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <Input
                          id="deviceId"
                          value={deviceId}
                          onChange={(e) => setDeviceId(e.target.value)}
                          placeholder="e.g. SPORS-DEVICE-01 or check lock screen"
                          className="flex-1 h-11 rounded-lg text-sm bg-white dark:bg-[#07090e] border-primary/40 font-mono text-foreground placeholder:text-slate-500 shadow-inner"
                        />
                        <Button onClick={handleDeviceSearch} className="h-11 px-6 font-semibold rounded-lg shadow-cyber-glow-sm">
                          <Search className="w-4 h-4 mr-2" />
                          Look Up Owner
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/70 rounded-xl border border-primary/25">
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <h4 className="font-semibold text-foreground mb-1 font-heading">How Anonymous Recovery Works</h4>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            Once you connect, you will enter an anonymous encrypted chat window. 
                            You can coordinate a safe handover in a public area, or arrange drop-off 
                            at the nearest police station desk.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chats" className="mt-6">
              <Card className="border border-border/80 shadow-cyber-border cyber-glass rounded-2xl cyber-corner">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    <span>Previous Conversations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {pastChats.length === 0 ? (
                    <div className="text-center p-8 text-xs text-muted-foreground">
                      <MessageCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground text-sm mb-1 font-heading">No Past Return Chats</h3>
                      <p>Your previous handover messages with device owners will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastChats.map((chat, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-secondary/40 rounded-xl border border-border hover:border-primary/40 transition-colors cursor-pointer gap-2 cyber-corner"
                          onClick={() => openPastChat(chat.deviceId, chat.deviceName, chat.sessionId)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-cyber-glow-sm">
                              <MessageCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{chat.deviceName}</p>
                              <p className="text-xs text-muted-foreground">{chat.lastMessage}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">{chat.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReportLostDevice;