import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wifi, Shield, MapPin, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "@/components/LoginDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";

const Layout = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border dark:bg-background/95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">SPORS</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/">
                <Button 
                  variant={isActive("/") ? "default" : "ghost"}
                  size="sm"
                >
                  Home
                </Button>
              </Link>
              <Link to="/report-lost">
                <Button 
                  variant={isActive("/report-lost") ? "default" : "ghost"}
                  size="sm"
                >
                  Report Lost
                </Button>
              </Link>
              <Link to="/find-my">
                <Button 
                  variant={isActive("/find-my") ? "default" : "ghost"}
                  size="sm"
                >
                  Find My Device
                </Button>
              </Link>
              <Link to="/report-found">
                <Button 
                  variant={isActive("/report-found") ? "default" : "ghost"}
                  size="sm"
                >
                  Help Find
                </Button>
              </Link>
              <Link to="/report-lost-device">
                <Button 
                  variant={isActive("/report-lost-device") ? "default" : "ghost"}
                  size="sm"
                >
                  Report Found Device
                </Button>
              </Link>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-muted-foreground mr-2">
                      Welcome, {user?.username}
                    </span>
                    {(user?.role === 'admin' || user?.role === 'police') && (
                      <Link to={user.role === 'admin' ? "/admin" : "/police"}>
                        <Button variant="outline" size="sm">Dashboard</Button>
                      </Link>
                    )}
                    <Link to="/register-device">
                      <Button variant="outline" size="sm">Register Device</Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/register">
                      <Button variant="outline" size="sm">Register</Button>
                    </Link>
                    <LoginDialog />
                  </>
                )}
              </div>
              
              <ThemeToggle />

              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile menu panel */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-border flex flex-col space-y-4">
              {isAuthenticated && (
                <div className="px-2 pb-2 border-b border-border">
                  <span className="text-sm font-medium text-foreground">Welcome, {user?.username}</span>
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={isActive("/") ? "default" : "ghost"} size="sm" className="w-full justify-start">Home</Button>
                </Link>
                <Link to="/report-lost" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={isActive("/report-lost") ? "default" : "ghost"} size="sm" className="w-full justify-start">Report Lost</Button>
                </Link>
                <Link to="/find-my" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={isActive("/find-my") ? "default" : "ghost"} size="sm" className="w-full justify-start">Find My Device</Button>
                </Link>
                <Link to="/report-found" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={isActive("/report-found") ? "default" : "ghost"} size="sm" className="w-full justify-start">Help Find</Button>
                </Link>
                <Link to="/report-lost-device" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant={isActive("/report-lost-device") ? "default" : "ghost"} size="sm" className="w-full justify-start">Report Found Device</Button>
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link to="/register-device" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant={isActive("/register-device") ? "default" : "ghost"} size="sm" className="w-full justify-start">Register Device</Button>
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'police') && (
                      <Link to={user.role === 'admin' ? "/admin" : "/police"} onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full justify-start">Dashboard</Button>
                      </Link>
                    )}
                    <Button variant="destructive" size="sm" className="w-full justify-start" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start">Register</Button>
                    </Link>
                    <div className="w-full [&>button]:w-full [&>button]:justify-start">
                      <LoginDialog />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-foreground">SPORS</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Community-driven device tracking network. Secure, anonymous, and reliable.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Anonymous tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4" />
                  <span>Community network</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team for assistance with your devices.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 FindMyNet. All rights reserved. Privacy-first device tracking.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;