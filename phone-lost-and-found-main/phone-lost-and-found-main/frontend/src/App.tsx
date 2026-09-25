import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ReportLost from "./pages/ReportLost";
import FindMyDevice from "./pages/FindMyDevice";
import ReportFound from "./pages/ReportFound";
import NotFound from "./pages/NotFound";
import ReportLostDevice from "./pages/ReportLostDevice";
import Register from "./pages/Register";
import RegisterDevice from "./pages/RegisterDevice";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="report-lost" element={<ReportLost />} />
                <Route path="find-my" element={<FindMyDevice />} />
                <Route path="report-found" element={<ReportFound />} />
                <Route path="report-lost-device" element={<ReportLostDevice />} />
                <Route path="register" element={<Register />} />
                <Route path="register-device" element={<RegisterDevice />} />
                <Route path="admin" element={<Dashboard />} />
                <Route path="police" element={<Dashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
