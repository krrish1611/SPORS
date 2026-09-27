import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LogIn, Shield, User, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { playUiClick, playCyberAlert } from "@/lib/sound";

export const LoginDialog = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();

    const role = await login(username, password);

    if (role) {
      playCyberAlert();
      toast.success(`Welcome back, ${username}!`);
      setOpen(false);
      setUsername("");
      setPassword("");
      
      if (role === 'admin') {
        navigate("/admin");
      } else if (role === 'police') {
        navigate("/police");
      } else {
        navigate("/");
      }
    } else {
      toast.error("Invalid credentials. Try sample / sample");
    }
  };

  const handleFillDemo = (userVal: string, passVal: string) => {
    playUiClick();
    setUsername(userVal);
    setPassword(passVal);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => playUiClick()}
          className="font-tech text-xs tracking-wider border-primary/40 hover:bg-primary/10"
        >
          <LogIn className="w-3.5 h-3.5 mr-1.5 text-primary" />
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md cyber-mecha-card cyber-corner font-tech border-primary/40 shadow-2xl p-6">
        <DialogHeader>
          <div className="hud-tag inline-block self-start text-[10px] mb-1">
            [ACCESS_CONTROL // AUTH_GATEWAY]
          </div>
          <DialogTitle className="text-xl font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Sign in to SPORS
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-sans">
            Access citizen registered handsets or official police station command logs.
          </DialogDescription>
        </DialogHeader>

        {/* Quick Demo Pre-fill Chips */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-card/60 border border-border/80 text-xs">
          <span className="text-muted-foreground text-[11px] font-mono font-bold">// QUICK DEMO:</span>
          <button
            type="button"
            onClick={() => handleFillDemo("sample", "sample")}
            className="px-2.5 py-1 rounded bg-background/80 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors border border-border flex items-center gap-1.5 font-mono text-[11px]"
          >
            <User className="w-3 h-3 text-primary" /> Citizen (sample)
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo("police", "police")}
            className="px-2.5 py-1 rounded bg-background/80 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors border border-border flex items-center gap-1.5 font-mono text-[11px]"
          >
            <Shield className="w-3 h-3 text-primary" /> Police (police)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs uppercase tracking-wider font-semibold">
              Username / Call-Sign
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="h-10 text-xs font-tech bg-background"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold">
              Passcode
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="h-10 text-xs font-tech bg-background"
              required
            />
          </div>
          <Button type="submit" className="w-full h-11 font-bold uppercase tracking-wider text-xs cyber-glow">
            Authenticate Session
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};