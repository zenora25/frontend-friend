
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
import HODStudentDetails from "@/pages/dashboard/HODStudentDetails.tsx";
import HODAssignStudent from "@/pages/dashboard/HODAssignStudent.tsx";

// Lazy load main pages
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const StudentRegister = lazy(() => import("@/pages/auth/StudentRegister"));
const StudentDashboard = lazy(() => import("@/pages/dashboard/StudentDashboard"));
const SupervisorDashboard = lazy(() => import("@/pages/dashboard/SupervisorDashboard"));
const IndustrySupervisorDashboard = lazy(() => import("@/pages/dashboard/IndustrySupervisorDashboard"));
const CoordinatorDashboard = lazy(() => import("@/pages/dashboard/CoordinatorDashboard"));
const HODDashboard = lazy(() => import("@/pages/dashboard/HODDashboard"));


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
            { label: "My Defense", href: "/dashboard/defense", icon: CalendarDays, description: "Defense schedule" },
            { label: "My Profile", href: "/dashboard/profile", icon: UserCircle, description: "Personal information" },
            { label: "Letters", href: "/dashboard/letters", icon: FileText, description: "Acceptance/completion letters" },
        ],
        dashboardPath: "/dashboard/overview",
        color: "from-blue-500 to-cyan-500",
    },
    institutionSupervisor: {
        label: "Institution Supervisor",
        icon: UserCheck,
        navItems: [
            { label: "Dashboard", href: "/dashboard/supervisor-dashboard", icon: LayoutDashboard, description: "Supervisor overview" },
            { label: "Assigned Students", href: "/dashboard/students", icon: Users, description: "Manage your students" },
            { label: "Logbook Reviews", href: "/dashboard/logbook-review", icon: ClipboardCheck, description: "Review submissions" },
            { label: "Defense Schedule", href: "/dashboard/defense", icon: Calendar, description: "Defense management" },
            { label: "Performance", href: "/dashboard/performance", icon: TrendingUp, description: "Review statistics" },
            { label: "Profile", href: "/dashboard/profile", icon: Settings, description: "Account settings" },
        ],
        dashboardPath: "/dashboard/supervisor-dashboard",
        color: "from-green-500 to-emerald-500",
    },
    industrySupervisor: {
        label: "Industry Supervisor",
        icon: Building2,
        navItems: [
            { label: "Dashboard", href: "/dashboard/industry-dashboard", icon: LayoutDashboard, description: "Industry overview" },
            { label: "Assigned Interns", href: "/dashboard/students", icon: Users, description: "Your assigned interns" },
            { label: "Weekly Reviews", href: "/dashboard/logbook-review", icon: BookText, description: "Review intern logbooks" },
            { label: "Company Profile", href: "/dashboard/profile", icon: BriefcaseBusiness, description: "Company information" },
            { label: "Evaluation", href: "/dashboard/evaluation", icon: FileCheck, description: "Student evaluation" },
        ],
        dashboardPath: "/dashboard/industry-dashboard",
        color: "from-orange-500 to-amber-500",
    },
    siwesCoordinator: {
        label: "SIWES Coordinator",
        icon: Shield,
        navItems: [
            { label: "Dashboard", href: "/dashboard/coordinator-dashboard", icon: LayoutDashboard, description: "System overview" },
            { label: "Verification Codes", href: "/dashboard/verification-codes", icon: Key, description: "Manage student codes" },
            { label: "All Students", href: "/dashboard/students", icon: GraduationCap, description: "All registered students" },
            { label: "Assignments", href: "/dashboard/assignments", icon: ClipboardList, description: "Supervisor assignments" },
            { label: "Defense Management", href: "/dashboard/defense-management", icon: Calendar, description: "Schedule defenses" },
            { label: "Reports", href: "/dashboard/reports", icon: BarChart3, description: "Generate reports" },
            { label: "System Settings", href: "/dashboard/settings", icon: Settings, description: "System configuration" },
        ],
        dashboardPath: "/dashboard/coordinator-dashboard",
        color: "from-purple-500 to-pink-500",
    },
    hod: {
        label: "Head of Department",
        icon: School,
        navItems: [
            { label: "Dashboard", href: "/dashboard/hod-dashboard", icon: LayoutDashboard, description: "Department overview" },
            { label: "Department Students", href: "/dashboard/students", icon: Users2, description: "All department students" },
            { label: "Assign Students", href: "/dashboard/hod/assign-students", icon: UserPlus, description: "Assign to supervisors" },
            { label: "Supervisors", href: "/dashboard/supervisors", icon: UserCheck, description: "Supervisor performance" },
            { label: "Defenses", href: "/dashboard/defenses", icon: CalendarDays, description: "Department defenses" },
            { label: "Logbooks", href: "/dashboard/logbooks", icon: BookMarked, description: "Logbook submissions" },
            { label: "Reports", href: "/dashboard/reports", icon: FileBarChart, description: "Department reports" },
            { label: "Profile", href: "/dashboard/profile", icon: UserCog, description: "Department settings" },
        ],
        dashboardPath: "/dashboard/hod-dashboard",
        color: "from-red-500 to-rose-500",
    },
};

// Loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-primary-foreground/20 flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-primary-foreground">InternTrack</span>
                    </div>

                    <h1 className="text-4xl font-bold text-primary-foreground mb-6">
                        Streamline Your SIWES Experience
                    </h1>
                    <p className="text-lg text-primary-foreground/80 mb-12">
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

                <p className="text-sm text-primary-foreground/60">
                    © 2024 InternTrack. Baze University SIWES Management System.
                </p>
            </div>

            {/* Right side - Auth forms */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
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
        <div className="w-10 h-10 bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 text-primary-foreground">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-primary-foreground">{title}</h3>
            <p className="text-sm text-primary-foreground/70">{description}</p>
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
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col flex-1 min-h-0 border-r border-border bg-card">
                    {/* Logo */}
                    <div className="flex h-16 shrink-0 items-center border-b border-border px-6">
                        <Link to={config.dashboardPath} className="flex items-center gap-3 group">
                            <div className={`w-11 h-11 bg-gradient-to-br ${config.color} flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg`}>
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <span className="text-xl font-bold text-foreground">InternTrack</span>
                                <p className="text-xs text-muted-foreground">{config.label}</p>
                            </div>
                        </Link>
                    </div>

                    {/* User Profile */}
                    <div className="border-b border-border p-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white font-semibold`}>
                                    {getInitials(user?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{user.fullName}</p>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                {user.department && (
                                    <p className="text-xs text-muted-foreground truncate">{user.department}</p>
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
                                                ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
                    <div className="border-t border-border p-4">
                        <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
                        <div className="space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => handleNavigation("/dashboard/profile")}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => handleNavigation("/dashboard/help")}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Help & Support
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-72">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-8">
                    <div className="flex flex-1 items-center gap-4">
                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetContent side="left" className="p-0 w-72">
                                    <div className="flex flex-col h-full">
                                        <div className="p-6 border-b border-border">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-11 h-11 bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                                                    <BookOpen className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-xl font-bold text-foreground">InternTrack</span>
                                            </div>
                                        </div>

                                        <div className="p-4 border-b border-border">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                                                    <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white font-semibold`}>
                                                        {getInitials(user?.fullName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{config.label}</p>
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
                                                                ? `bg-gradient-to-r ${config.color} text-white shadow-md`
                                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                                        )}
                                                    >
                                                        <item.icon className={cn(
                                                            "w-5 h-5",
                                                            isActive ? "text-white" : "text-current"
                                                        )} />
                                                        <div className="flex-1 text-left">
                                                            <div>{item.label}</div>
                                                            {item.description && (
                                                                <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                                                            )}
                                                        </div>
                                                        {isActive && (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </nav>

                                        <div className="p-4 border-t border-border">
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Log Out
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 bg-gradient-to-br ${config.color} flex items-center justify-center rounded-lg`}>
                                <config.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-foreground">
                                    {getCurrentPageTitle()}
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    {config.label} Dashboard
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <div className="p-4 border-b">
                                    <h3 className="font-semibold">Notifications</h3>
                                    <p className="text-sm text-muted-foreground">You have 3 new notifications</p>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {[1, 2, 3].map((i) => (
                                        <DropdownMenuItem key={i} className="flex items-start gap-3 p-3 cursor-pointer">
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <Bell className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">New logbook submitted</p>
                                                <p className="text-xs text-muted-foreground">2 hours ago</p>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                                <div className="p-2 border-t">
                                    <Button variant="ghost" className="w-full justify-center" size="sm">
                                        View all notifications
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-3 pl-1 pr-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white text-sm font-semibold`}>
                                            {getInitials(user?.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium">{user.fullName}</p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {user.role?.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="p-4">
                                    <p className="text-sm font-medium">{user.fullName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    <div className="mt-2">
                                        <Badge variant="secondary" className={`bg-gradient-to-r ${config.color} text-white`}>
                                            {config.label}
                                        </Badge>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleNavigation("/dashboard/profile")}>
                                    <UserCircle className="w-4 h-4 mr-2" />
                                    My Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleNavigation("/dashboard/settings")}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1">
                    <div className="p-4 lg:p-8">
                        {/* Breadcrumb */}
                        <div className="flex items-center text-sm text-muted-foreground mb-6">
                            <Link to={config.dashboardPath} className="hover:text-foreground transition-colors">
                                Dashboard
                            </Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-foreground font-medium">{getCurrentPageTitle()}</span>
                        </div>

                        {/* Page Content */}
                        <div className="animate-in fade-in duration-300">
                            <Suspense fallback={<LoadingSpinner />}>
                                <Outlet />
                            </Suspense>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-border py-4 px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between text-sm text-muted-foreground">
                        <div className="mb-2 md:mb-0">
                            <p>© 2024 InternTrack. Baze University SIWES Management System.</p>
                            <p className="text-xs mt-1">Version 2.0.0</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                            <Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link>
                        </div>
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
            <BrowserRouter>
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

                                    {/* Simple placeholder pages for student */}
                                    <Route
                                        path="logbook"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <div className="text-center py-12">
                                                    <BookText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">My Logbook</h2>
                                                    <p className="text-muted-foreground">Logbook management coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="logbook/submit"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <div className="text-center py-12">
                                                    <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Submit Logbook Entry</h2>
                                                    <p className="text-muted-foreground">Logbook submission form coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="defense"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <div className="text-center py-12">
                                                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">My Defense</h2>
                                                    <p className="text-muted-foreground">Defense management coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="profile"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <div className="text-center py-12">
                                                    <UserCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">My Profile</h2>
                                                    <p className="text-muted-foreground">Profile management coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="letters"
                                        element={
                                            <ProtectedRoute requiredRole="student">
                                                <div className="text-center py-12">
                                                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Letters</h2>
                                                    <p className="text-muted-foreground">Letter management coming soon</p>
                                                </div>
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

                                    {/* Simple placeholder for supervisor pages */}
                                    <Route
                                        path="students"
                                        element={
                                            <ProtectedRoute requiredRole={["institutionSupervisor", "industrySupervisor", "hod", "siwesCoordinator"]}>
                                                <div className="text-center py-12">
                                                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Student Management</h2>
                                                    <p className="text-muted-foreground">Student management interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="logbook-review"
                                        element={
                                            <ProtectedRoute requiredRole={["institutionSupervisor", "industrySupervisor"]}>
                                                <div className="text-center py-12">
                                                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Logbook Review</h2>
                                                    <p className="text-muted-foreground">Logbook review interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="performance"
                                        element={
                                            <ProtectedRoute requiredRole="institutionSupervisor">
                                                <div className="text-center py-12">
                                                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Performance</h2>
                                                    <p className="text-muted-foreground">Performance analytics coming soon</p>
                                                </div>
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

                                    <Route
                                        path="evaluation"
                                        element={
                                            <ProtectedRoute requiredRole="industrySupervisor">
                                                <div className="text-center py-12">
                                                    <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Student Evaluation</h2>
                                                    <p className="text-muted-foreground">Student evaluation form coming soon</p>
                                                </div>
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

                                    <Route
                                        path="hod/students/:id"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <HODStudentDetails />
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="hod/assign-students"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <HODAssignStudent />
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Simple placeholder for HOD pages */}
                                    <Route
                                        path="supervisors"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <div className="text-center py-12">
                                                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Supervisor Management</h2>
                                                    <p className="text-muted-foreground">Supervisor management interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="defenses"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <div className="text-center py-12">
                                                    <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Department Defenses</h2>
                                                    <p className="text-muted-foreground">Defense management interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="logbooks"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <div className="text-center py-12">
                                                    <BookMarked className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Department Logbooks</h2>
                                                    <p className="text-muted-foreground">Logbook management interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="reports"
                                        element={
                                            <ProtectedRoute requiredRole="hod">
                                                <div className="text-center py-12">
                                                    <FileBarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Department Reports</h2>
                                                    <p className="text-muted-foreground">Reporting interface coming soon</p>
                                                </div>
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

                                    {/* Simple placeholder for coordinator pages */}
                                    <Route
                                        path="verification-codes"
                                        element={
                                            <ProtectedRoute requiredRole="siwesCoordinator">
                                                <div className="text-center py-12">
                                                    <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Verification Codes</h2>
                                                    <p className="text-muted-foreground">Verification code management interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="assignments"
                                        element={
                                            <ProtectedRoute requiredRole={["hod", "siwesCoordinator"]}>
                                                <div className="text-center py-12">
                                                    <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Assignments</h2>
                                                    <p className="text-muted-foreground">Assignment management interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="defense-management"
                                        element={
                                            <ProtectedRoute requiredRole="siwesCoordinator">
                                                <div className="text-center py-12">
                                                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Defense Management</h2>
                                                    <p className="text-muted-foreground">Defense management interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    <Route
                                        path="settings"
                                        element={
                                            <ProtectedRoute requiredRole="siwesCoordinator">
                                                <div className="text-center py-12">
                                                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">System Settings</h2>
                                                    <p className="text-muted-foreground">System settings interface coming soon</p>
                                                </div>
                                            </ProtectedRoute>
                                        }
                                    />

                                    {/* Common routes for all */}
                                    <Route
                                        path="help"
                                        element={
                                            <ProtectedRoute requiredRole={["student", "institutionSupervisor", "industrySupervisor", "hod", "siwesCoordinator"]}>
                                                <div className="text-center py-12">
                                                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h2 className="text-2xl font-bold mb-2">Help & Support</h2>
                                                    <p className="text-muted-foreground">Help center coming soon</p>
                                                </div>
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
