
import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    BookOpen,
    LayoutDashboard,
    BookText,
    Calendar,
    Users,
    Settings,
    LogOut,
    Menu,
    ChevronDown,
    Bell,
    Shield,
    UserCheck,
    Building2,
    Sparkles,
    FileText,
    ClipboardList,
    BarChart3,
    GraduationCap,
    Briefcase,
    Home,
    UserPlus,
    FileCheck,
    Award,
    Clock,
    TrendingUp,
    Mail,
    Phone,
    MapPin,
    UserCircle,
    ShieldCheck,
    CheckCircle,
    AlertCircle,
    Loader2,
    Plus,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    Copy,
    Check,
    ChevronRight,
    ChevronLeft,
    MoreVertical,
    Star,
    Target,
    PieChart,
    LineChart,
    Users2,
    BookMarked,
    CalendarDays,
    FolderOpen,
    Notebook,
    FileBarChart,
    School,
    Building,
    BriefcaseBusiness,
    ClipboardCheck,
    UserCog,
    FileEdit,
    Key,
    BuildingIcon,
    UserSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Lazy load all pages
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const StudentRegister = lazy(() => import("@/pages/auth/StudentRegister"));
const StudentDashboard = lazy(() => import("@/pages/dashboard/StudentDashboard"));
const SupervisorDashboard = lazy(() => import("@/pages/dashboard/SupervisorDashboard"));
const IndustrySupervisorDashboard = lazy(() => import("@/pages/dashboard/IndustrySupervisorDashboard"));
const CoordinatorDashboard = lazy(() => import("@/pages/dashboard/CoordinatorDashboard"));
const HODDashboard = lazy(() => import("@/pages/dashboard/HODDashboard"));

// Logbook components
const WeeklyLogbook = lazy(() => import("@/pages/logbook/WeeklyLogbook"));
const SubmitLogbook = lazy(() => import("@/pages/logbook/SubmitLogbook"));
const LogbookDetails = lazy(() => import("@/pages/logbook/LogbookDetails"));
const LogbookReview = lazy(() => import("@/pages/logbook/LogbookReview"));

// Profile and Management pages
const Profile = lazy(() => import("@/pages/Profile"));
const Students = lazy(() => import("@/pages/students/Students"));
const StudentDetails = lazy(() => import("@/pages/students/StudentDetails"));
const AssignStudents = lazy(() => import("@/pages/students/AssignStudents"));
const VerificationCodes = lazy(() => import("@/pages/coordinator/VerificationCodes"));

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
        },
    },
});

// Define navigation configuration for each role
type RoleKey = "student" | "institutionSupervisor" | "industrySupervisor" | "siwesCoordinator" | "hod";

const roleConfig: Record<RoleKey, {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    navItems: {
        label: string;
        href: string;
        icon: React.ComponentType<{ className?: string }>;
        description?: string;
    }[];
    dashboardPath: string;
    color: string;
}> = {
    student: {
        label: "Student",
        icon: GraduationCap,
        navItems: [
            { label: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard, description: "Overview and progress" },
            { label: "My Logbook", href: "/dashboard/logbook", icon: BookText, description: "Weekly entries" },
            { label: "Submit Entry", href: "/dashboard/logbook/submit", icon: FileEdit, description: "New logbook entry" },
            { label: "My Profile", href: "/dashboard/profile", icon: UserCircle, description: "Personal information" },
        ],
        dashboardPath: "/dashboard/overview",
        color: "from-gray-700 to-gray-900",
    },
    institutionSupervisor: {
        label: "Institution Supervisor",
        icon: UserCheck,
        navItems: [
            { label: "Dashboard", href: "/dashboard/supervisor-dashboard", icon: LayoutDashboard, description: "Supervisor overview" },
            { label: "Assigned Students", href: "/dashboard/students", icon: Users, description: "Manage your students" },
            { label: "Logbook Reviews", href: "/dashboard/logbook-review", icon: ClipboardCheck, description: "Review submissions" },
            { label: "My Profile", href: "/dashboard/profile", icon: UserCircle, description: "Account settings" },
        ],
        dashboardPath: "/dashboard/supervisor-dashboard",
        color: "from-gray-700 to-gray-900",
    },
    industrySupervisor: {
        label: "Industry Supervisor",
        icon: Building2,
        navItems: [
            { label: "Dashboard", href: "/dashboard/industry-dashboard", icon: LayoutDashboard, description: "Industry overview" },
            { label: "Assigned Interns", href: "/dashboard/students", icon: Users, description: "Your assigned interns" },
            { label: "Weekly Reviews", href: "/dashboard/logbook-review", icon: BookText, description: "Review intern logbooks" },
            { label: "My Profile", href: "/dashboard/profile", icon: UserCircle, description: "Account information" },
        ],
        dashboardPath: "/dashboard/industry-dashboard",
        color: "from-gray-700 to-gray-900",
    },
    siwesCoordinator: {
        label: "SIWES Coordinator",
        icon: Shield,
        navItems: [
            { label: "Dashboard", href: "/dashboard/coordinator-dashboard", icon: LayoutDashboard, description: "System overview" },
            { label: "Verification Codes", href: "/dashboard/verification-codes", icon: Key, description: "Manage student codes" },
            { label: "All Students", href: "/dashboard/students", icon: GraduationCap, description: "All registered students" },
            { label: "My Profile", href: "/dashboard/profile", icon: UserCircle, description: "Account settings" },
        ],
        dashboardPath: "/dashboard/coordinator-dashboard",
        color: "from-gray-700 to-gray-900",
    },
    hod: {
        label: "Head of Department",
        icon: School,
        navItems: [
            { label: "Dashboard", href: "/dashboard/hod-dashboard", icon: LayoutDashboard, description: "Department overview" },
            { label: "Department Students", href: "/dashboard/students", icon: Users2, description: "All department students" },
            { label: "Verification Codes", href: "/dashboard/verification-codes", icon: Key, description: "Manage student codes" },
            { label: "Assign Students", href: "/dashboard/assign-students", icon: UserPlus, description: "Assign to supervisors" },
            { label: "My Profile", href: "/dashboard/profile", icon: UserCircle, description: "Account settings" },
        ],
        dashboardPath: "/dashboard/hod-dashboard",
        color: "from-gray-700 to-gray-900",
    },
};

// Loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
    </div>
);

// Protected Route Component
const ProtectedRoute = ({
    children,
    requiredRole
}: {
    children: React.ReactNode;
    requiredRole?: string | string[];
}) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
            // Redirect to appropriate dashboard
            let redirectPath = "/dashboard";
            switch (user.role) {
                case "student":
                    redirectPath = "/dashboard/overview";
                    break;
                case "institutionSupervisor":
                    redirectPath = "/dashboard/supervisor-dashboard";
                    break;
                case "industrySupervisor":
                    redirectPath = "/dashboard/industry-dashboard";
                    break;
                case "hod":
                    redirectPath = "/dashboard/hod-dashboard";
                    break;
                case "siwesCoordinator":
                    redirectPath = "/dashboard/coordinator-dashboard";
                    break;
            }
            return <Navigate to={redirectPath} replace />;
        }
    }

    return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
};

// Auth Layout Component
const AuthLayout = () => {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-white/10 flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">InternTrack</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-6">
                        Streamline Your SIWES Experience
                    </h1>
                    <p className="text-lg text-gray-300 mb-12">
                        A comprehensive digital platform for managing Student Industrial Work Experience Scheme documentation, monitoring, and evaluation.
                    </p>

                    <div className="space-y-6">
                        <FeatureItem
                            icon={<ClipboardCheck className="w-5 h-5" />}
                            title="Digital Logbooks"
                            description="Submit and track weekly activities online"
                        />
                        <FeatureItem
                            icon={<Users className="w-5 h-5" />}
                            title="Multi-Role Access"
                            description="Dashboards for students, supervisors, and coordinators"
                        />
                        <FeatureItem
                            icon={<Shield className="w-5 h-5" />}
                            title="Secure Verification"
                            description="Coordinator-generated codes for authentic registration"
                        />
                    </div>
                </div>

                <p className="text-sm text-gray-400">
                    © 2024 InternTrack. Baze University SIWES Management System.
                </p>
            </div>

            {/* Right side - Auth forms */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <Suspense fallback={<LoadingSpinner />}>
                        <Outlet />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-white/10 flex items-center justify-center flex-shrink-0 text-white">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-sm text-gray-300">{description}</p>
        </div>
    </div>
);

// Dashboard Layout Component
const DashboardLayout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Map user role to config key
    const getRoleKey = (role?: string): RoleKey => {
        const roleMap: Record<string, RoleKey> = {
            student: "student",
            institutionSupervisor: "institutionSupervisor",
            industrySupervisor: "industrySupervisor",
            siwesCoordinator: "siwesCoordinator",
            coordinator: "siwesCoordinator",
            hod: "hod",
        };
        return roleMap[role || "student"] || "student";
    };

    const roleKey = getRoleKey(user?.role);
    const config = roleConfig[roleKey];

    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleNavigation = (href: string) => {
        navigate(href);
        setMobileMenuOpen(false);
    };

    const getCurrentPageTitle = () => {
        // Extract base path without query params
        const currentPath = location.pathname.split('?')[0];
        const currentItem = config.navItems.find((item) =>
            currentPath.startsWith(item.href.split('?')[0])
        );
        return currentItem?.label || "Dashboard";
    };

    if (!user) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col flex-1 min-h-0 border-r border-gray-200 bg-white">
                    {/* Logo */}
                    <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
                        <Link to={config.dashboardPath} className="flex items-center gap-3 group">
                            <div className={`w-11 h-11 bg-gradient-to-br ${config.color} flex items-center justify-center group-hover:scale-105 transition-transform shadow`}>
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-gray-900">InternTrack</span>
                                <p className="text-xs text-gray-500">{config.label}</p>
                            </div>
                        </Link>
                    </div>

                    {/* User Profile */}
                    <div className="border-b border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                                <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white font-semibold`}>
                                    {getInitials(user?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                {user.department && (
                                    <p className="text-xs text-gray-500 truncate">{user.department}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="space-y-1">
                            {config.navItems.map((item) => {
                                const isActive = location.pathname.startsWith(item.href.split('?')[0]);
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => handleNavigation(item.href)}
                                        className={cn(
                                            "w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-200 rounded-lg group",
                                            isActive
                                                ? `bg-gradient-to-r ${config.color} text-white shadow`
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-transform",
                                            !isActive && "group-hover:scale-110"
                                        )} />
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{item.label}</div>
                                            {item.description && (
                                                <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                                            )}
                                        </div>
                                        {isActive && (
                                            <div className="ml-2">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Quick Actions */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                onClick={() => handleNavigation("/dashboard/profile")}
                            >
                                <UserCircle className="w-4 h-4 mr-2" />
                                My Profile
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-72">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-4 lg:px-8">
                    <div className="flex flex-1 items-center gap-4">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 bg-gradient-to-br ${config.color} flex items-center justify-center rounded-lg`}>
                                <config.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    {getCurrentPageTitle()}
                                </h1>
                                <p className="text-xs text-gray-500">
                                    {config.label} Dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-3 pl-1 pr-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white text-sm font-semibold`}>
                                            {getInitials(user?.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 capitalize">
                                            {user.role?.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 border border-gray-200">
                                <div className="p-4">
                                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    <div className="mt-2">
                                        <Badge variant="secondary" className={`bg-gradient-to-r ${config.color} text-white`}>
                                            {config.label}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleNavigation("/dashboard/profile")} className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                    <UserCircle className="w-4 h-4 mr-2" />
                                    My Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 w-72">
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className={`w-11 h-11 bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900">InternTrack</span>
                                </div>
                            </div>

                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-2 ring-gray-200">
                                        <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white font-semibold`}>
                                            {getInitials(user?.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{config.label}</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {config.navItems.map((item) => {
                                    const isActive = location.pathname.startsWith(item.href.split('?')[0]);
                                    return (
                                        <button
                                            key={item.href}
                                            onClick={() => handleNavigation(item.href)}
                                            className={cn(
                                                "w-full text-left flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-200 rounded-lg",
                                                isActive
                                                    ? `bg-gradient-to-r ${config.color} text-white shadow`
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "w-5 h-5",
                                                isActive ? "text-white" : "text-current"
                                            )} />
                                            <div className="flex-1 text-left">
                                                <div>{item.label}</div>
                                                {item.description && (
                                                    <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                                                )}
                                            </div>
                                            {isActive && (
                                                <ChevronRight className="w-4 h-4 text-white" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    className="w-full border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log Out
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Main Content Area */}
                <main className="flex-1">
                    <div className="p-4 lg:p-8">
                        {/* Page Content */}
                        <div className="animate-in fade-in duration-300">
                            <Suspense fallback={<LoadingSpinner />}>
                                <Outlet />
                            </Suspense>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-200 py-4 px-6 bg-white">
                    <div className="text-center text-sm text-gray-500">
                        <p>© 2024 InternTrack. Baze University SIWES Management System.</p>
                        <p className="text-xs mt-1 text-gray-400">Version 2.0.0</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// Main App Component
function App() {
    return (
        <React.StrictMode>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider>
                        <AuthProvider>
                            <Routes>
                                {/* Auth Routes */}
                                <Route path="/" element={<AuthLayout />}>
                                    <Route index element={<Navigate to="/login" replace />} />
                                    <Route path="login" element={<Login />} />
                                    <Route path="register" element={<Register />} />
                                    <Route path="student-register" element={<StudentRegister />} />
                                </Route>

                                {/* Dashboard Routes */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <DashboardLayout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<Navigate to="overview" replace />} />

                                    {/* Student Routes */}
                                    <Route
                                        path="overview"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <StudentDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Student Logbook Routes */}
                                    <Route
                                        path="logbook"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <WeeklyLogbook />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="logbook/submit"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <SubmitLogbook />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="logbook/:id"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <LogbookDetails />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Logbook Review Routes */}
                                    <Route
                                        path="logbook-review"
                                        element={
                                            <ProtectedRoute requiredRole={["institutionSupervisor", "industrySupervisor"]}>
                                                <LogbookReview />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="logbook/:id/review"
                                        element={
                                            <ProtectedRoute requiredRole={["institutionSupervisor", "industrySupervisor"]}>
                                                <LogbookReview />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Profile */}
                                    <Route
                                        path="profile"
                                        element={
                                            <ProtectedRoute>
                                                <Profile />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Supervisor Dashboard */}
                                    <Route
                                        path="supervisor-dashboard"
                                        element={
                                            <ProtectedRoute requiredRole="institutionSupervisor">
                                                <SupervisorDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="students"
                                        element={
                                            <ProtectedRoute requiredRole={["institutionSupervisor", "industrySupervisor", "hod", "siwesCoordinator"]}>
                                                <Students />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="students/:id"
                                        element={
                                            <ProtectedRoute requiredRole={["institutionSupervisor", "industrySupervisor", "hod", "siwesCoordinator"]}>
                                                <StudentDetails />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Industry Supervisor Dashboard */}
                                    <Route
                                        path="industry-dashboard"
                                        element={
                                            <ProtectedRoute requiredRole="industrySupervisor">
                                                <IndustrySupervisorDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* HOD Dashboard */}
                                    <Route
                                        path="hod-dashboard"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <HODDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* HOD Assign Students */}
                                    <Route
                                        path="assign-students"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <AssignStudents />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Coordinator Dashboard */}
                                    <Route
                                        path="coordinator-dashboard"
                                        element={
                                            <ProtectedRoute requiredRole="siwesCoordinator">
                                                <CoordinatorDashboard />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Coordinator Verification Codes */}
                                    <Route
                                        path="verification-codes"
                                        element={
                                            <ProtectedRoute requiredRole={["siwesCoordinator", "hod"]}>
                                                <VerificationCodes />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Route>

                                {/* Redirect unknown routes */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                            <Toaster />
                        </AuthProvider>
                    </TooltipProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
}

export default App;
