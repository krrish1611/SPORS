import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWithFallback } from "@/lib/api";

const RegisterDevice = () => {
  const [devicename, setDeviceName] = useState("");
  const [imei, setImei] = useState("");
  const [serialno, setSerialno] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, addDeviceToUser } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You must be logged in to register a device.
        </p>
        <Button onClick={() => navigate("/")} className="w-full">
          Go back to Home
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalUsername = user?.username;

    if (!finalUsername) {
      toast.error("Please provide a username to associate with this device.");
      setLoading(false);
      return;
    }

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

      // Add the new device to the global user state so it shows up in "Find My Device" immediately
      if (addDeviceToUser) {
        addDeviceToUser({
          id: data.deviceid,
          name: devicename,
          location: { lat: 0, lng: 0, address: "Unknown location" },
          lastSeen: "Unknown"
        });
      }

      toast.success(`Device registered successfully! ID: ${data.deviceid}`);
      navigate("/");
    } catch (error: any) {
      console.error("Device registration failed:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
        Device Registration
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="devicename">Device Name</Label>
          <Input
            id="devicename"
            type="text"
            value={devicename}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. John's iPhone 13"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imei">IMEI (Optional)</Label>
          <Input
            id="imei"
            type="text"
            value={imei}
            onChange={(e) => setImei(e.target.value)}
            placeholder="Enter device IMEI"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serialno">Serial No (Optional)</Label>
          <Input
            id="serialno"
            type="text"
            value={serialno}
            onChange={(e) => setSerialno(e.target.value)}
            placeholder="Enter device Serial No"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registering..." : "Register Device"}
        </Button>
      </form>
    </div>
  );
};

export default RegisterDevice;
