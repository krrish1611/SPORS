import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Radio, Shield, MapPin, ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 sm:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="bg-gradient-primary bg-clip-text text-transparent">SPORS</span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
            The power of a community-driven network to protect your devices. 
            Locate your offline items securely and anonymously.
          </p>
          <Link to="/report-lost">
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our network uses advanced technology to help you find your devices while maintaining complete privacy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="group hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Broadcast Signal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your device sends out a secure, low-energy Bluetooth signal, 
                  acting like an anonymous beacon.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Network Detection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Other phones in the network detect this signal as they pass by, 
                  recording the location anonymously.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-elegant transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-soft">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Securely Locate</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You can see the last known location on a map. The entire process 
                  is end-to-end encrypted for privacy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Protect Your Devices?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust FindMyNet to keep their devices safe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/report-lost">
              <Button variant="hero" size="lg">
                Report Lost Device
              </Button>
            </Link>
            <Link to="/report-found">
              <Button variant="outline" size="lg">
                Help Find Devices
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;