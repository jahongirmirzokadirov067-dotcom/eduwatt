import { ThemeProvider } from "@/hooks/useTheme";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import DataInput from "./pages/DataInput.tsx";
import Solar from "./pages/Solar.tsx";
import GridPage from "./pages/Grid.tsx";
import Alerts from "./pages/Alerts.tsx";
import Reports from "./pages/Reports.tsx";
import Impact from "./pages/Impact.tsx";
import Zones from "./pages/Zones.tsx";
import Settings from "./pages/Settings.tsx";
import Login from "./pages/Login.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
                <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
                <Route path="/solar" element={<RequireAuth><Solar /></RequireAuth>} />
                <Route path="/grid" element={<RequireAuth><GridPage /></RequireAuth>} />
                <Route path="/alerts" element={<RequireAuth><Alerts /></RequireAuth>} />
                <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
                <Route path="/data-input" element={<RequireAuth><DataInput /></RequireAuth>} />
                <Route path="/impact" element={<RequireAuth><Impact /></RequireAuth>} />
                <Route path="/zones" element={<RequireAuth><Zones /></RequireAuth>} />
                <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </LanguageProvider>
);

export default App;
