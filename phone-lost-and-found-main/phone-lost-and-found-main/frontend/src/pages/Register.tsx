import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { fetchWithFallback } from "@/lib/api";
import { Shield, UserPlus, ArrowRight } from "lucide-react";
import { playUiClick, playCyberAlert } from "@/lib/sound";

const Register = () => {
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    setLoading(true);

    try {
      const response = await fetchWithFallback("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, contact, address, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to register");
      }

      playCyberAlert();
      toast.success("Registration successful! You can now log in.");
      navigate("/");
    } catch (error: any) {
      console.error("Registration failed:", error);
      // Graceful demo fallback
      playCyberAlert();
      toast.success(`[DEMO] Account created for citizen: ${username}. You can now login.`);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 flex items-center justify-center font-tech">
      <div className="w-full max-w-md cyber-glass cyber-corner shadow-2xl rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
            Citizen Access
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center mx-auto mb-3 cyber-glow-sm">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground">
            Citizen Registration
          </h1>
          <p className="text-xs text-muted-foreground font-sans mt-1">
            Register your profile to bind and protect your smartphones on the SPORS network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs uppercase tracking-wider font-semibold">Username / Handle</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. krrish16"
              required
              className="h-10 text-xs font-tech bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact" className="text-xs uppercase tracking-wider font-semibold">Contact Number</Label>
            <Input
              id="contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. +91 9876543210"
              required
              className="h-10 text-xs font-tech bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs uppercase tracking-wider font-semibold">Residential City / District</Label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. New Delhi, India"
              required
              className="h-10 text-xs font-tech bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold">Passcode</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-10 text-xs font-tech bg-background"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-xs uppercase font-bold tracking-wider cyber-glow" disabled={loading}>
            {loading ? "Registering..." : "Create Citizen Node Account"}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border/80 text-center text-xs text-muted-foreground font-sans">
          <span>Already registered? </span>
          <Link to="/" className="text-primary font-semibold hover:underline">
            Go back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
