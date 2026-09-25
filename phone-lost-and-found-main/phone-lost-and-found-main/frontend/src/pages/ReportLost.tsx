import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { fetchWithFallback } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const ReportLost = () => {
  const { user } = useAuth();
  const [deviceId, setDeviceId] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [status, setStatus] = useState<"idle" | "reporting" | "success_lost" | "success_found" | "error">("idle");

  const handleAction = async (action: 'lost' | 'found', targetId: string = deviceId) => {
    if (!targetId.trim()) {
      toast.error("Please enter a device ID");
      return;
    }

    setIsReporting(true);
    setStatus("reporting");

    try {
      const endpoint = action === 'lost' ? `/reportlost/${targetId}` : `/markfound/${targetId}`;
      const response = await fetchWithFallback(endpoint, {
        method: 'POST',
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus(action === 'lost' ? "success_lost" : "success_found");
        toast.success(data.message || `Device successfully marked as ${action}!`);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setStatus("idle");
          setDeviceId("");
        }, 3000);
      } else {
        throw new Error(data.message || `Failed to mark device as ${action}`);
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      toast.error(error.message || "Network error occurred.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 px-4 sm:px-0">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Report Device Status
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Enter the unique ID of your device to mark it as lost or found in the global network.
            </p>
          </div>

          {/* Form Card */}
          <Card className="shadow-elegant border-0 mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center text-xl">Manual Device Entry</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deviceId" className="text-sm font-medium text-foreground">
                    Device ID
                  </Label>
                  <Input
                    id="deviceId"
                    type="text"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="Enter Device ID"
                    className="h-12 text-base w-full"
                    disabled={isReporting}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="button" 
                    onClick={() => handleAction('lost', deviceId)}
                    className="flex-1 h-12 text-base w-full"
                    variant="destructive"
                    disabled={isReporting}
                  >
                    {isReporting && status !== "success_found" ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-2" />
                    )}
                    Mark as Lost
                  </Button>
                  
                  <Button 
                    type="button" 
                    onClick={() => handleAction('found', deviceId)}
                    className="flex-1 h-12 text-base w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isReporting}
                  >
                    {isReporting && status !== "success_lost" ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Mark as Found
                  </Button>
                </div>
              </div>

              {/* Status Messages */}
              <div className="mt-6">
                {status === "reporting" && (
                  <div className="flex items-center justify-center p-4 bg-primary/10 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-3"></div>
                    <span className="text-primary font-medium text-sm sm:text-base">Updating device status...</span>
                  </div>
                )}
                
                {(status === "success_lost" || status === "success_found") && (
                  <div className="flex items-center justify-center p-4 bg-accent/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-accent mr-3 shrink-0" />
                    <span className="text-accent font-medium text-sm sm:text-base">
                      {status === "success_lost" ? "Device successfully marked as lost." : "Device removed from lost registry."}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Select Devices */}
          {user && (
            <Card className="shadow-elegant border-0 mb-8 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-center text-xl">Quick Select from Your Devices</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-8">
                {user.devices && user.devices.length > 0 ? (
                  <div className="space-y-4">
                    {user.devices.map((device) => (
                      <div key={device.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors gap-4">
                        <div className="flex items-center gap-4 break-all">
                          <div className="bg-primary/10 p-3 rounded-full shrink-0">
                            <Smartphone className="w-6 h-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{device.name}</h3>
                            <p className="text-sm text-muted-foreground font-mono mt-1 truncate">{device.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="destructive" 
                            size="icon"
                            onClick={() => handleAction('lost', device.id)}
                            disabled={isReporting}
                            title="Mark as Lost"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </Button>
                          <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                            size="icon"
                            onClick={() => handleAction('found', device.id)}
                            disabled={isReporting}
                            title="Mark as Found"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't registered any devices yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <div className="mt-12 text-center">
            <Card className="bg-muted/30 border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
                <p className="text-muted-foreground text-sm">
                  Marking as lost adds your device to our network's watchlist. When other FindMyNet users 
                  come within range, they'll anonymously report its location. Marking as found immediately removes it from the tracking network.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportLost;