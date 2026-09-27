import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  MapPin, 
  ArrowRight, 
  Search, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Lock, 
  Compass, 
  HeartHandshake, 
  FileText
} from "lucide-react";

export default function Home() {
  const [activeRole, setActiveRole] = useState<"citizen" | "police">("citizen");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<null | {
    id: string;
    model: string;
    status: "tracking" | "police_station" | "not_reported";
    location: string;
    time: string;
    stationName?: string;
  }>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Interactive recovery timeline simulation stage (1 to 4)
  const [timelineStage, setTimelineStage] = useState<number>(3);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    setTimeout(() => {
      setIsSearching(false);
      const query = searchQuery.trim().toUpperCase();
      if (query.includes("POLICE") || query.includes("STATION") || query.includes("NCPD")) {
        setSearchResult({
          id: query,
          model: "Samsung Galaxy S24 Ultra",
          status: "police_station",
          location: "Central Police Station, Evidence Locker #12",
          time: "Logged by Sub-Inspector Verma 25 minutes ago",
          stationName: "Central District Headquarters",
        });
      } else if (query.includes("NOT") || query.includes("UNKNOWN")) {
        setSearchResult({
          id: query,
          model: "Unregistered Device",
          status: "not_reported",
          location: "No active broadcast records in network",
          time: "N/A",
        });
      } else {
        setSearchResult({
          id: query,
          model: "Google Pixel 8 Pro",
          status: "tracking",
          location: "Sector 14 Tech District (28.6139° N, 77.2090° E)",
          time: "Last signal picked up 6 minutes ago by 3 passing relays",
        });
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-foreground relative z-10">
      
      {/* Hero Section */}
      <section className="pt-10 pb-16 sm:pt-16 sm:pb-20 border-b border-border/70 relative">
        <div className="container mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28">
          
          {/* Status Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-foreground shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Decentralized Lost & Found Phone Network</span>
            </div>
          </div>

          {/* Main Title & Value Proposition */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-heading mb-6 leading-tight">
              Lost Your Phone? Let the <br />
              <span className="text-primary drop-shadow-[0_0_25px_rgba(239,68,68,0.25)] dark:drop-shadow-[0_0_25px_rgba(161,186,138,0.35)]">
                Community & Police
              </span>{" "}
              Find It Fast.
            </h1>
            <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-medium leading-relaxed max-w-2xl mx-auto">
              When your smartphone goes missing, nearby phones automatically and anonymously 
              relay its Bluetooth beacon to pinpoint its exact coordinates on a live map for you and local police desks.
            </p>
          </div>

          {/* Role Switcher (Citizen vs Police) */}
          <div className="max-w-xs mx-auto mb-10 cyber-glass p-1.5 rounded-xl border border-primary/30 shadow-sm flex">
            <button
              onClick={() => setActiveRole("citizen")}
              className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "citizen"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground font-medium"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Citizen Portal</span>
            </button>
            <button
              onClick={() => setActiveRole("police")}
              className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeRole === "police"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-foreground font-medium"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Police Portal</span>
            </button>
          </div>

          {/* Action Cards */}
          {activeRole === "citizen" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
              <Link to="/find-my" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-primary/30">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        Track Device Live
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        View live GPS coordinates, recent ping timestamps, and nearby addresses in real time.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-primary">
                      <span>Open Live Map</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/report-lost" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-rose-500/30">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        Report Lost Phone
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Broadcast your device hardware ID to trigger background scans across the peer mesh.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-rose-500">
                      <span>Activate Beacon</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/report-found" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-primary/30">
                        <HeartHandshake className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        Help Community
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Enable passive Bluetooth scanning on your device to anonymously assist neighbors find lost items.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-primary">
                      <span>Join Scanner Network</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/report-lost-device" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-amber-500/30">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        Found a Phone?
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Connect anonymously with the verified owner or find the nearest police station drop-off.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-amber-500">
                      <span>Anonymous Contact</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
              <Link to="/police" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-primary/30">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        Station Command
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Monitor active missing reports, GPS coordinate logs, and verified claim requests.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-primary">
                      <span>Open Desk</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/find-my" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-cyan-500/30">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        Stolen IMEI Search
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Verify whether a recovered or seized mobile phone is flagged stolen in police records.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-cyan-500">
                      <span>Verify Handset</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/report-lost-device" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-emerald-500/30">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        Station Handover Log
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Log recovered handsets dropped off by citizens and generate official return receipts.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-emerald-500">
                      <span>Log Custody Entry</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/police" className="group">
                <Card className="h-full cyber-mecha-card rounded-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-primary/30">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                        FIR & Case Dossier
                      </h3>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        Export cryptographically verified location history for official police investigations.
                      </p>
                    </div>
                    <div className="mt-5 flex items-center text-xs font-bold text-primary">
                      <span>Export Case Dossier</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}

          {/* Fast IMEI & Device ID Inquiry Bar */}
          <div className="max-w-3xl mx-auto cyber-mecha-card border border-primary/30 shadow-cyber-border rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Quick Network Handset Lookup
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                Instant Status Search
              </span>
            </div>

            <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-2.5 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Device ID or 15-digit IMEI number..."
                  className="pl-10 h-11 text-sm bg-white dark:bg-[#07090e] rounded-lg border-primary/40 font-mono text-foreground placeholder:text-slate-500 focus-visible:ring-primary shadow-inner"
                />
              </div>
              <Button type="submit" disabled={isSearching} className="h-11 px-6 font-bold rounded-lg shadow-cyber-glow-sm">
                {isSearching ? "Searching..." : "Search Handset"}
              </Button>
            </form>

            {/* Interactive sample quick chips */}
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-semibold text-xs">Sample searches:</span>
              <button
                type="button"
                onClick={() => { setSearchQuery("SPORS-DEVICE-01"); setSearchResult(null); }}
                className="px-2.5 py-1 rounded-md bg-secondary/90 hover:bg-primary/15 text-slate-900 dark:text-slate-100 hover:text-primary transition-colors border border-primary/30 font-mono text-[11px] font-bold"
              >
                SPORS-DEVICE-01 (Active)
              </button>
              <button
                type="button"
                onClick={() => { setSearchQuery("POLICE-STATION-LOCKED"); setSearchResult(null); }}
                className="px-2.5 py-1 rounded-md bg-secondary/90 hover:bg-primary/15 text-slate-900 dark:text-slate-100 hover:text-primary transition-colors border border-primary/30 font-mono text-[11px] font-bold"
              >
                POLICE-STATION-LOCKED (Secured)
              </button>
            </div>

            {/* Live Search Result Feedback Card */}
            {searchResult && (
              <div className="mt-4 p-4 rounded-xl bg-secondary/70 border border-primary/40 transition-all cyber-corner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    {searchResult.status === "police_station" ? (
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Building2 className="w-5 h-5" />
                      </div>
                    ) : searchResult.status === "tracking" ? (
                      <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-cyber-glow-sm border border-primary/30">
                        <MapPin className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center shrink-0 border border-destructive/30">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{searchResult.model}</span>
                        <span className={`hud-tag text-[10px] px-2 py-0.5 rounded-full ${
                          searchResult.status === "police_station"
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : searchResult.status === "tracking"
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-destructive/15 text-destructive border border-destructive/30"
                        }`}>
                          {searchResult.status === "police_station" 
                            ? "SECURED AT STATION" 
                            : searchResult.status === "tracking" 
                            ? "ACTIVE SIGNAL RELAYED" 
                            : "NOT REGISTERED"}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 mt-1 flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{searchResult.location}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        {searchResult.time}
                      </p>
                    </div>
                  </div>

                  <Link to="/find-my">
                    <Button size="sm" className="text-xs rounded-lg whitespace-nowrap shadow-cyber-glow-sm">
                      Open in Map <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>



      {/* Interactive Recovery Timeline & State Simulator */}
      <section className="py-16 sm:py-20 border-b border-border/70 relative">
        <div className="container mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
              Recovery Lifecycle
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-3">
              Interactive Device Recovery Lifecycle
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Click any stage below to inspect how SPORS coordinates cryptographic beacons between the device owner, 
              anonymous passersby, and police station officers.
            </p>
          </div>

          {/* Interactive Stepper Navigation with Cyber Mecha Styling */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { num: 1, title: "1. Device Lost", desc: "Beacon Broadcast" },
              { num: 2, title: "2. Signal Relayed", desc: "Passerby Detected" },
              { num: 3, title: "3. GPS Coordinates", desc: "Owner Maps Fix" },
              { num: 4, title: "4. Station Return", desc: "Police Handover" },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => setTimelineStage(step.num)}
                className={`p-4 rounded-xl text-left border transition-all cyber-corner ${
                  timelineStage === step.num
                    ? "cyber-mecha-card border-primary ring-2 ring-primary/40 shadow-cyber-glow"
                    : "cyber-mecha-card border-border/70 hover:border-primary/50 opacity-90 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold font-heading flex items-center gap-1 ${
                    timelineStage === step.num ? "text-primary" : "text-slate-700 dark:text-slate-200"
                  }`}>
                    {step.title}
                  </span>
                  {timelineStage >= step.num && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">{step.desc}</span>
              </button>
            ))}
          </div>

          {/* Stage Details Presentation Card */}
          <Card className="border border-primary/30 shadow-cyber-border cyber-mecha-card cyber-top-line overflow-hidden rounded-2xl cyber-corner">
            <CardContent className="p-6 sm:p-8">
              {timelineStage === 1 && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold border border-rose-500/20">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Step 1 • Beacon Broadcast</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-heading">
                      Continuous Ultra-Low Energy Bluetooth Chirps
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      As soon as you report your phone lost, it broadcasts an anonymous cryptographic beacon every 
                      few seconds. It requires zero mobile data, works even with the SIM removed, and consumes 
                      less than 0.2% battery life per hour.
                    </p>
                  </div>
                  <Link to="/report-lost">
                    <Button className="rounded-lg text-xs font-semibold shadow-cyber-glow-sm">
                      Report a Device Lost
                    </Button>
                  </Link>
                </div>
              )}

              {timelineStage === 2 && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Step 2 • Mesh Relay</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-heading">
                      Silent Passing Detections by Community Mesh
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      When a fellow citizen with SPORS walks within 30 meters, their phone silently captures the signal 
                      and sends an encrypted GPS coordinate packet to our server. The helper never sees your identity, 
                      and you never see their location.
                    </p>
                  </div>
                  <Link to="/report-found">
                    <Button variant="outline" className="rounded-lg text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10">
                      Join as Community Helper
                    </Button>
                  </Link>
                </div>
              )}

              {timelineStage === 3 && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-xs font-semibold border border-cyan-500/20">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Step 3 • GPS Coordinate Fix</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-heading">
                      Owner Views Live Location on Interactive Map
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Log in to your SPORS dashboard or enter your hardware ID to view the latest timestamped 
                      street location and movement trajectory. You can immediately share this coordinate dossier with 
                      the nearest police patrol.
                    </p>
                  </div>
                  <Link to="/find-my">
                    <Button className="rounded-lg text-xs font-semibold shadow-cyber-glow-sm">
                      View Live Map Demo
                    </Button>
                  </Link>
                </div>
              )}

              {timelineStage === 4 && (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Step 4 • Station Handover</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground font-heading">
                      Secure Drop-Off at Verified Police Station Desks
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Good samaritans can turn the phone in at any participating police station. The duty officer logs 
                      the device ID into the station custody register, notifying the owner to claim it with their official 
                      ownership receipt.
                    </p>
                  </div>
                  <Link to="/police">
                    <Button variant="outline" className="rounded-lg text-xs font-semibold border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
                      Explore Police Desk
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>



      {/* Trust & Privacy Assurance Banner */}
      <section className="py-16 text-center relative">
        <div className="container mx-auto px-4 sm:px-8 md:px-14 lg:px-20 xl:px-28 max-w-3xl">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 shadow-cyber-glow-sm border border-primary/30 cyber-chamfer">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20 mb-3">
            Privacy & Security First
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground mb-3">
            Designed for Citizen Privacy & Community Safety
          </h2>
          <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed font-medium">
            The SPORS protocol does not track phone browsing, user contacts, or location history. 
            All beacon telemetry is encrypted end-to-end and exclusively accessible to the device owner and law enforcement dispatch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/find-my">
              <Button size="lg" className="rounded-lg font-semibold text-sm h-11 px-6 shadow-cyber-glow-sm">
                Track Lost Phone
              </Button>
            </Link>
            <Link to="/report-found">
              <Button size="lg" variant="outline" className="rounded-lg font-semibold text-sm h-11 px-6 border-primary/40 text-primary hover:bg-primary/10">
                Help as Community Volunteer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}