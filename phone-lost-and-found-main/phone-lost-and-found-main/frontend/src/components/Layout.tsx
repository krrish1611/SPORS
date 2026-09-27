import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, LogOut, Menu, X, Smartphone, Building2, Search, HeartHandshake, Cpu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CyberMechaBackground } from "@/components/CyberMechaBackground";
import { useState, useEffect } from "react";

const Layout = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-foreground relative overflow-x-hidden selection:bg-primary/25 selection:text-primary">
      {/* Cyber Mecha Full-Screen Circuit Background & HUD Frame (References 1 & 2) */}
      <CyberMechaBackground />

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 cyber-glass border-b border-border/80 transition-colors shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-cyber-glow-sm group-hover:scale-105 transition-all cyber-chamfer border border-primary-glow/40">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-foreground font-heading leading-tight">
                SPORS
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold hidden sm:block">
                Citizen & Police Device Network
              </span>
            </div>
          </Link>

          {/* Clean Navigation Links with Cyber Chamfer Indicators */}
          <nav className="hidden md:flex items-center space-x-1 font-semibold text-sm">
            <Link to="/">
              <Button 
                variant={isActive("/") ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg transition-all ${
                  isActive("/") 
                    ? "bg-primary/15 text-primary border border-primary/35 font-bold shadow-sm" 
                    : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/10"
                }`}
              >
                Home
              </Button>
            </Link>
            <Link to="/find-my">
              <Button 
                variant={isActive("/find-my") ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg transition-all ${
                  isActive("/find-my") 
                    ? "bg-primary/15 text-primary border border-primary/35 font-bold shadow-sm" 
                    : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                Track Device
              </Button>
            </Link>
            <Link to="/report-lost">
              <Button 
                variant={isActive("/report-lost") ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg transition-all ${
                  isActive("/report-lost") 
                    ? "bg-primary/15 text-primary border border-primary/35 font-bold shadow-sm" 
                    : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/10"
                }`}
              >
                Report Lost
              </Button>
            </Link>
            <Link to="/report-found">
              <Button 
                variant={isActive("/report-found") ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg transition-all ${
                  isActive("/report-found") 
                    ? "bg-primary/15 text-primary border border-primary/35 font-bold shadow-sm" 
                    : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Help Community
              </Button>
            </Link>
            <Link to="/report-lost-device">
              <Button 
                variant={isActive("/report-lost-device") ? "secondary" : "ghost"}
                size="sm"
                className={`rounded-lg transition-all ${
                  isActive("/report-lost-device") 
                    ? "bg-primary/15 text-primary border border-primary/35 font-bold shadow-sm" 
                    : "text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/10"
                }`}
              >
                Found a Phone
              </Button>
            </Link>
          </nav>

          {/* Right Side: Police Link, Auth & Theme Toggle */}
          <div className="flex items-center space-x-2">
            <Link to="/police" className="hidden lg:inline-flex">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border-primary/40 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Police Portal</span>
              </Button>
            </Link>

            <ThemeToggle />

            {/* User authentication controls */}
            <div className="hidden sm:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Link to="/register-device">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs font-medium">
                      <Smartphone className="w-3.5 h-3.5 mr-1" />
                      Add Device
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={logout}
                    className="text-xs text-muted-foreground hover:text-destructive rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="ghost" size="sm" className="text-xs font-medium rounded-lg">
                      Register
                    </Button>
                  </Link>
                  <LoginDialog />
                </>
              )}
            </div>

            {/* Mobile menu trigger */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden w-9 h-9 p-0 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-lg px-4 py-4 space-y-2">
            {isAuthenticated && (
              <div className="px-3 py-2 bg-secondary/60 rounded-lg text-xs font-medium flex items-center justify-between mb-3">
                <span className="text-foreground">Signed in as: {user?.username}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            )}
            
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm" className="w-full justify-start rounded-lg">
                Home
              </Button>
            </Link>
            <Link to="/find-my" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant={isActive("/find-my") ? "secondary" : "ghost"} size="sm" className="w-full justify-start rounded-lg">
                <Search className="w-4 h-4 mr-2" /> Track Device
              </Button>
            </Link>
            <Link to="/report-lost" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant={isActive("/report-lost") ? "secondary" : "ghost"} size="sm" className="w-full justify-start rounded-lg">
                <Smartphone className="w-4 h-4 mr-2" /> Report Lost Phone
              </Button>
            </Link>
            <Link to="/report-found" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant={isActive("/report-found") ? "secondary" : "ghost"} size="sm" className="w-full justify-start rounded-lg">
                <HeartHandshake className="w-4 h-4 mr-2 text-primary" /> Help Community
              </Button>
            </Link>
            <Link to="/report-lost-device" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant={isActive("/report-lost-device") ? "secondary" : "ghost"} size="sm" className="w-full justify-start rounded-lg">
                Found a Phone
              </Button>
            </Link>
            <Link to="/police" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full justify-start rounded-lg text-primary border-primary/30">
                <Building2 className="w-4 h-4 mr-2" /> Police Portal & Dispatch
              </Button>
            </Link>

            <div className="pt-2 border-t border-border flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link to="/register-device" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start rounded-lg">
                      <Smartphone className="w-4 h-4 mr-2" /> Register Handset
                    </Button>
                  </Link>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full justify-start rounded-lg" 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-lg">Register</Button>
                  </Link>
                  <div className="flex-1">
                    <LoginDialog />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Glowing Circuit Trace Bus Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent relative z-30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent dark:via-primary/60 animate-pulse" />
      </div>

      {/* Main Content (Strictly overlayed on top of background) */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* High-Tech Cyber Footer */}
      <footer className="cyber-glass border-t border-border/80 py-12 relative z-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-cyber-glow-sm">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-lg text-foreground tracking-tight">
                  SPORS Network
                </span>
                <span className="hud-tag text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-4">
                Smart Phone Online Recovery System — a secure, privacy-first community mesh network 
                locating missing devices and coordinating rapid returns with local police stations.
              </p>
              <div className="flex items-center space-x-2 text-xs font-mono text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Zero-Knowledge BLE Relay • E2E Encrypted • Govt Station Integration</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 font-heading flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Quick Navigation
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/find-my" className="hover:text-primary transition-colors">Track Lost Device</Link></li>
                <li><Link to="/report-lost" className="hover:text-primary transition-colors">Report Stolen Handset</Link></li>
                <li><Link to="/report-found" className="hover:text-primary transition-colors">Community Scanner</Link></li>
                <li><Link to="/report-lost-device" className="hover:text-primary transition-colors">Anonymous Return Chat</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-foreground mb-3 font-heading flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Law Enforcement
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/police" className="hover:text-primary transition-colors">Police Station Command</Link></li>
                <li><Link to="/find-my" className="hover:text-primary transition-colors">Stolen IMEI Registry</Link></li>
                <li><span className="text-muted-foreground/80 font-mono text-xs">Emergency Desk: 112 / Central</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
            <p>© 2026 SPORS (Smart Phone Online Recovery System). All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <span>Citizen Privacy Guaranteed</span>
              <span>•</span>
              <span className="text-primary font-semibold">End-to-End Encrypted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;