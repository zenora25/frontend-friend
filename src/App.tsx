// App.tsx (enhanced)
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
// Import additional pages you might need
import Profile from "./pages/Profile";
// import Settings from "./pages/Settings";
// import StudentsList from "./pages/StudentsList";
// import SupervisorsList from "./pages/SupervisorsList";
// import Assignments from "./pages/Assignments";
// import VerificationCodes from "./pages/VerificationCodes";
// import Reports from "./pages/Reports";
import LogbookReview from "./pages/logbook/LogbookReview";
import LogbookDetails from "./pages/logbook/LogbookDetails";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const App = () => (
    <ErrorBoundary>
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
                            <Route path="/forgot-password" element={<div>Forgot Password Page</div>} />
                            <Route path="/reset-password" element={<div>Reset Password Page</div>} />
                        </Route>

                        {/* Protected dashboard routes */}
                        <Route element={<DashboardLayout />}>
                            {/* Dashboard Routes */}
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

                            {/* Logbook Routes */}
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
                                path="/logbook/:id"
                                element={
                                    <ProtectedRoute allowedRoles={['student']}>
                                        <LogbookDetails />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/logbook/review/:id"
                                element={
                                    <ProtectedRoute allowedRoles={['institutionSupervisor', 'industrySupervisor']}>
                                        <LogbookReview />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Defense Routes */}
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

                            {/* Management Routes */}
                            {/*<Route*/}
                            {/*    path="/students"*/}
                            {/*    element={*/}
                            {/*        <ProtectedRoute allowedRoles={['institutionSupervisor', 'hod', 'siwesCoordinator']}>*/}
                            {/*            <StudentsList />*/}
                            {/*        </ProtectedRoute>*/}
                            {/*    }*/}
                            {/*/>*/}
                            {/*<Route*/}
                            {/*    path="/supervisors"*/}
                            {/*    element={*/}
                            {/*        <ProtectedRoute allowedRoles={['hod', 'siwesCoordinator']}>*/}
                            {/*            <SupervisorsList />*/}
                            {/*        </ProtectedRoute>*/}
                            {/*    }*/}
                            {/*/>*/}
                            {/*<Route*/}
                            {/*    path="/assignments"*/}
                            {/*    element={*/}
                            {/*        <ProtectedRoute allowedRoles={['hod', 'siwesCoordinator']}>*/}
                            {/*            <Assignments />*/}
                            {/*        </ProtectedRoute>*/}
                            {/*    }*/}
                            {/*/>*/}
                            {/*<Route*/}
                            {/*    path="/verification-codes"*/}
                            {/*    element={*/}
                            {/*        <ProtectedRoute allowedRoles={['siwesCoordinator']}>*/}
                            {/*            <VerificationCodes />*/}
                            {/*        </ProtectedRoute>*/}
                            {/*    }*/}
                            {/*/>*/}
                            {/*<Route*/}
                            {/*    path="/reports"*/}
                            {/*    element={*/}
                            {/*        <ProtectedRoute allowedRoles={['hod', 'siwesCoordinator']}>*/}
                            {/*            <Reports />*/}
                            {/*        </ProtectedRoute>*/}
                            {/*    }*/}
                            {/*/>*/}

                            {/* Profile & Settings */}
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'institutionSupervisor', 'industrySupervisor', 'hod', 'siwesCoordinator']}>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />
                            {/*<Route*/}
                            {/*    path="/settings"*/}
                            {/*    element={*/}
                            {/*        <ProtectedRoute allowedRoles={['student', 'institutionSupervisor', 'industrySupervisor', 'hod', 'siwesCoordinator']}>*/}
                            {/*            <Settings />*/}
                            {/*        </ProtectedRoute>*/}
                            {/*    }*/}
                            {/*/>*/}

                            {/* Redirect for invalid roles */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute allowedRoles={['student', 'institutionSupervisor', 'industrySupervisor', 'hod', 'siwesCoordinator']}>
                                        <Navigate to="/dashboard" replace />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>

                        {/* 404 Page */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
);

export default App;