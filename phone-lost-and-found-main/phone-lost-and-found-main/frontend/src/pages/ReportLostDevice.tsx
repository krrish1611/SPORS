import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, Search, MessageCircle, History, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AnonymousChat } from "@/components/AnonymousChat";

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
      const { fetchWithFallback } = await import('@/lib/api');
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
      console.error(e);
      toast.error("Failed to load past chats");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.username) {
      loadPastChats();
    }
  }, [isAuthenticated, user?.username]);

  const handleDeviceSearch = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first to report a found device");
      return;
    }

    if (!deviceId.trim()) {
      toast.error("Please enter a device ID");
      return;
    }

    try {
      const { fetchWithFallback } = await import('@/lib/api');
      const res = await fetchWithFallback(`/device/${deviceId}`);
      
      if (res.ok) {
        const device = await res.json();
        const sessionId = `${device.id}_${user?.username}`;
        setFoundDevice({ id: device.id, name: device.name, sessionId });
        setShowChat(true);
        toast.success(`Device found! Opening chat...`);
      } else {
        toast.error("Device ID not found in our system");
        setFoundDevice(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error searching for device");
    }
  };

  const openPastChat = (deviceId: string, deviceName: string, sessionId: string) => {
    setFoundDevice({ id: deviceId, name: deviceName, sessionId });
    setDeviceId(deviceId);
    setShowChat(true);
  };

  if (showChat && foundDevice) {
    return (
      <div className="min-h-screen py-12 sm:py-20">
        <div className="container mx-auto px-6">
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
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Report Found Device
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Found a lost device? Enter its ID to connect anonymously with the owner and help them get it back.
            </p>
          </div>

          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="report">Report Found Device</TabsTrigger>
              <TabsTrigger value="chats" onClick={loadPastChats}>Past Chats</TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="mt-8">
              <Card className="shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Device Lookup
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!isAuthenticated ? (
                    <div className="text-center p-8">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                      <p className="text-muted-foreground mb-4">
                        Please login to report a found device and communicate with the owner.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="deviceId">Device ID</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="deviceId"
                            value={deviceId}
                            onChange={(e) => setDeviceId(e.target.value)}
                            placeholder="Enter device ID (e.g., SIH_TEAM_SAPPHIRE001)"
                            className="flex-1"
                          />
                          <Button onClick={handleDeviceSearch}>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-accent/10 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-accent mt-0.5" />
                          <div>
                            <h4 className="font-medium text-accent mb-1">How it works</h4>
                            <p className="text-sm text-muted-foreground">
                              Enter the device ID found on the lost device. If it matches a reported device in our system, 
                              you'll be connected with the owner through an anonymous chat.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chats" className="mt-8">
              <Card className="shadow-elegant border-0">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Past Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {pastChats.length === 0 ? (
                    <div className="text-center p-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Past Chats</h3>
                      <p className="text-muted-foreground">
                        Your previous conversations with device owners will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastChats.map((chat, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer gap-2 sm:gap-0"
                          onClick={() => openPastChat(chat.deviceId, chat.deviceName, chat.sessionId)}
                        >
                          <div className="flex items-center space-x-3 break-all">
                            <div className="w-10 h-10 shrink-0 bg-primary/20 rounded-full flex items-center justify-center">
                              <MessageCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{chat.deviceName}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.lastMessage}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{chat.timestamp}</span>
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