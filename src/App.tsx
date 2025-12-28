import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthLayout from "./components/layouts/AuthLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentRegister from "./pages/auth/StudentRegister";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import SupervisorDashboard from "./pages/dashboard/SupervisorDashboard";
import CoordinatorDashboard from "./pages/dashboard/CoordinatorDashboard";
import HODDashboard from "./pages/dashboard/HODDashboard";
import IndustrySupervisorDashboard from "./pages/dashboard/IndustrySupervisorDashboard";
import WeeklyLogbook from "./pages/logbook/WeeklyLogbook";
import SubmitLogbook from "./pages/logbook/SubmitLogbook";
import StudentDefense from "./pages/defense/StudentDefense";
import DefenseManagement from "./pages/defense/DefenseManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student-register" element={<StudentRegister />} />
          </Route>

          {/* Dashboard routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
            <Route path="/coordinator-dashboard" element={<CoordinatorDashboard />} />
            <Route path="/hod-dashboard" element={<HODDashboard />} />
            <Route path="/industry-dashboard" element={<IndustrySupervisorDashboard />} />
            <Route path="/logbook" element={<WeeklyLogbook />} />
            <Route path="/logbook/new" element={<SubmitLogbook />} />
            <Route path="/defense" element={<StudentDefense />} />
            <Route path="/defense-management" element={<DefenseManagement />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
