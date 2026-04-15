import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Pages ở root src/pages/
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Onboarding from "./pages/Onboarding";
import Admin from "./pages/Admin";

// Pages trong folder sensors/
import SensorsList from "./pages/sensors/List";
import SensorDetail from "./pages/sensors/Detail";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            
            {/* Route sensors */}
            <Route path="/sensors" element={<SensorsList />} />
            <Route path="/sensors/:id" element={<SensorDetail />} />
            
            {/* Các route khác */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/history" element={<History />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
    </QueryClientProvider>
  );
}