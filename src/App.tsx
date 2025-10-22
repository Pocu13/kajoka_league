import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TournamentProvider } from "@/contexts/TournamentContext";
import { Navigation } from "@/components/Navigation";
import Home from "./pages/Home";
import Standings from "./pages/Standings";
import Calendar from "./pages/Calendar";
import Groups from "./pages/Groups";
import Teams from "./pages/Teams";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Create QueryClient outside component to prevent recreation on hot reload
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TournamentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/classifiche" element={<Standings />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/gironi" element={<Groups />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TournamentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
