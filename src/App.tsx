// App.tsx (updated)
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Auth routes (public) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/student-register" element={<StudentRegister />} />
            </Route>

            {/* Protected dashboard routes */}
            <Route element={<DashboardLayout />}>
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/supervisor-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['institutionSupervisor']}>
                    <SupervisorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/coordinator-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['siwesCoordinator']}>
                    <CoordinatorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hod-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['hod']}>
                    <HODDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/industry-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['industrySupervisor']}>
                    <IndustrySupervisorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/logbook" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <WeeklyLogbook />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/logbook/new" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <SubmitLogbook />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/defense" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDefense />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/defense-management" 
                element={
                  <ProtectedRoute allowedRoles={['institutionSupervisor', 'hod', 'siwesCoordinator']}>
                    <DefenseManagement />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;