
import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

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
      { label: "My Logbook", href: "/logbook", icon: BookText, description: "Weekly entries" },
      { label: "Submit Entry", href: "/logbook/submit", icon: FileEdit, description: "New logbook entry" },
      { label: "My Defense", href: "/defense", icon: CalendarDays, description: "Defense schedule" },
      { label: "My Profile", href: "/profile", icon: UserCircle, description: "Personal information" },
      { label: "Letters", href: "/letters", icon: FileText, description: "Acceptance/completion letters" },
    ],
    dashboardPath: "/dashboard/overview",
    color: "from-blue-500 to-cyan-500",
  },
  institutionSupervisor: {
    label: "Institution Supervisor",
    icon: UserCheck,
    navItems: [
      { label: "Dashboard", href: "/dashboard/supervisor-dashboard", icon: LayoutDashboard, description: "Supervisor overview" },
      { label: "Assigned Students", href: "/students", icon: Users, description: "Manage your students" },
      { label: "Logbook Reviews", href: "/logbook-review", icon: ClipboardCheck, description: "Review submissions" },
      { label: "Defense Schedule", href: "/defense", icon: Calendar, description: "Defense management" },
      { label: "Performance", href: "/performance", icon: TrendingUp, description: "Review statistics" },
      { label: "Profile", href: "/profile", icon: Settings, description: "Account settings" },
    ],
    dashboardPath: "/dashboard/supervisor-dashboard",
    color: "from-green-500 to-emerald-500",
  },
  industrySupervisor: {
    label: "Industry Supervisor",
    icon: Building2,
    navItems: [
      { label: "Dashboard", href: "/dashboard/industry-dashboard", icon: LayoutDashboard, description: "Industry overview" },
      { label: "Assigned Interns", href: "/students", icon: Users, description: "Your assigned interns" },
      { label: "Weekly Reviews", href: "/logbook-review", icon: BookText, description: "Review intern logbooks" },
      { label: "Company Profile", href: "/profile", icon: BriefcaseBusiness, description: "Company information" },
      { label: "Evaluation", href: "/evaluation", icon: FileCheck, description: "Student evaluation" },
    ],
    dashboardPath: "/dashboard/industry-dashboard",
    color: "from-orange-500 to-amber-500",
  },
  siwesCoordinator: {
    label: "SIWES Coordinator",
    icon: Shield,
    navItems: [
      { label: "Dashboard", href: "/dashboard/coordinator-dashboard", icon: LayoutDashboard, description: "System overview" },
      { label: "Verification Codes", href: "/verification-codes", icon: ShieldCheck, description: "Manage student codes" },
      { label: "All Students", href: "/students", icon: GraduationCap, description: "All registered students" },
      { label: "Assignments", href: "/assignments", icon: ClipboardList, description: "Supervisor assignments" },
      { label: "Defense Management", href: "/defense-management", icon: Calendar, description: "Schedule defenses" },
      { label: "Reports", href: "/reports", icon: BarChart3, description: "Generate reports" },
      { label: "System Settings", href: "/settings", icon: Settings, description: "System configuration" },
    ],
    dashboardPath: "/dashboard/coordinator-dashboard",
    color: "from-purple-500 to-pink-500",
  },
  hod: {
    label: "Head of Department",
    icon: School,
    navItems: [
      { label: "Dashboard", href: "/dashboard/hod-dashboard", icon: LayoutDashboard, description: "Department overview" },
      { label: "Department Students", href: "/dashboard/hod-dashboard?tab=students", icon: Users2, description: "All department students" },
      { label: "Assign Students", href: "/dashboard/hod/assign-students", icon: UserPlus, description: "Assign to supervisors" },
      { label: "Supervisors", href: "/dashboard/hod-dashboard?tab=supervisors", icon: UserCheck, description: "Supervisor performance" },
      { label: "Defenses", href: "/dashboard/hod-dashboard?tab=defenses", icon: CalendarDays, description: "Department defenses" },
      { label: "Logbooks", href: "/dashboard/hod-dashboard?tab=logbooks", icon: BookMarked, description: "Logbook submissions" },
      { label: "Reports", href: "/dashboard/hod-dashboard?tab=reports", icon: FileBarChart, description: "Department reports" },
      { label: "Profile", href: "/profile", icon: UserCog, description: "Department settings" },
    ],
    dashboardPath: "/dashboard/hod-dashboard",
    color: "from-red-500 to-rose-500",
  },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

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
    setSidebarOpen(false);
    setMobileMenuOpen(false);
  };

  const getCurrentPageTitle = () => {
    const currentItem = config.navItems.find((item) =>
        location.pathname.startsWith(item.href.split('?')[0])
    );
    return currentItem?.label || "Dashboard";
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // Mobile sidebar component
  const MobileSidebar = () => (
      <div className="lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-foreground">InternTrack</span>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className={`bg-gradient-to-br ${config.color} text-white font-semibold`}>
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user?.fullName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{config.label}</p>
                    {user?.department && (
                        <p className="text-xs text-muted-foreground">{user.department}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
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

              {/* Logout Button */}
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
  );

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
                  <p className="font-medium text-foreground truncate">{user?.fullName || "User"}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email || ""}</p>
                  {user?.department && (
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

            {/* Quick Stats (optional) */}
            <div className="border-t border-border p-4">
              <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
              <div className="space-y-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/profile")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleNavigation("/help")}
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
              <MobileSidebar />

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
                      <p className="text-sm font-medium">{user?.fullName || "User"}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role?.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-4">
                    <p className="text-sm font-medium">{user?.fullName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                    <div className="mt-2">
                      <Badge variant="secondary" className={`bg-gradient-to-r ${config.color} text-white`}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
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
                <Outlet />
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

export default DashboardLayout;
