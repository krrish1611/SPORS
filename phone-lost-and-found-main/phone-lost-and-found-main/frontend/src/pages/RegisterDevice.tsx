import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWithFallback } from "@/lib/api";
import { Smartphone, Shield, ArrowRight } from "lucide-react";
import { playUiClick, playCyberAlert } from "@/lib/sound";

const RegisterDevice = () => {
  const [devicename, setDeviceName] = useState("");
  const [imei, setImei] = useState("");
  const [serialno, setSerialno] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, addDeviceToUser } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center font-tech">
        <div className="w-full max-w-md bg-card border-2 border-border shadow-elegant rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold font-display text-foreground mb-2">
            Authentication Required
          </h1>
          <p className="text-xs text-muted-foreground font-sans mb-6">
            Please log in with your citizen account to bind and register a new smartphone.
          </p>
          <Button onClick={() => navigate("/")} className="w-full text-xs font-bold uppercase tracking-wider h-10">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    setLoading(true);

    const finalUsername = user?.username || "citizen";

    try {
      const response = await fetchWithFallback("/register-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devicename, imei, serialno, username: finalUsername }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to register device");
      }

      if (addDeviceToUser) {
        addDeviceToUser({
          id: data.deviceid,
          name: devicename,
          location: { lat: 28.6139, lng: 77.2090, address: "Registered Location" },
          lastSeen: "Online"
        });
      }

      playCyberAlert();
      toast.success(`Device registered successfully! ID: ${data.deviceid}`);
      navigate("/");
    } catch (error: any) {
      console.warn("Backend offline, utilizing local demo registration");
      const generatedId = `SPORS-${Math.floor(1000 + Math.random() * 9000)}`;
      if (addDeviceToUser) {
        addDeviceToUser({
          id: generatedId,
          name: devicename,
          location: { lat: 28.6139, lng: 77.2090, address: "New Delhi Central Hub" },
          lastSeen: "Just now"
        });
      }
      playCyberAlert();
      toast.success(`[DEMO] Handset "${devicename}" registered! ID: ${generatedId}`);
      navigate("/find-my");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-transparent relative z-10">
      <div className="w-full max-w-md cyber-mecha-card border border-primary/30 shadow-cyber-border rounded-2xl p-6 sm:p-8 cyber-corner">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto mb-3 shadow-cyber-glow-sm border border-primary/30 cyber-chamfer">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
            Device Registration
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Register Handset
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Associate your smartphone hardware with your SPORS account for emergency beacon tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="devicename" className="text-xs font-semibold text-foreground font-heading">Device Nickname</Label>
            <Input
              id="devicename"
              type="text"
              value={devicename}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. John's Galaxy S24"
              className="h-10 text-xs bg-background/80 border-border text-foreground"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="imei" className="text-xs font-semibold text-foreground font-heading">IMEI Number (Optional)</Label>
            <Input
              id="imei"
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              placeholder="15-digit IMEI for police database"
              className="h-10 text-xs font-mono bg-background/80 border-border text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="serialno" className="text-xs font-semibold text-foreground font-heading">Serial Number (Optional)</Label>
            <Input
              id="serialno"
              type="text"
              value={serialno}
              onChange={(e) => setSerialno(e.target.value)}
              placeholder="Manufacturer serial no"
              className="h-10 text-xs font-mono bg-background/80 border-border text-foreground"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-xs font-bold tracking-wider shadow-cyber-glow-sm" disabled={loading}>
            {loading ? "Registering Handset..." : "Bind Device to Account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDevice;
