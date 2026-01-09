import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type RoleKey = "student" | "institutionSupervisor" | "industrySupervisor" | "siwesCoordinator" | "hod";

const roleConfig: Record<RoleKey, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  navItems: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Weekly Logbook", href: "/logbook", icon: BookText },
      { label: "Submit Entry", href: "/logbook/submit", icon: FileText },
      { label: "My Defense", href: "/defense", icon: Calendar },
      { label: "My Profile", href: "/profile", icon: Users },
    ],
  },
  institutionSupervisor: {
    label: "Institution Supervisor",
    icon: UserCheck,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Students", href: "/students", icon: Users },
      { label: "Logbook Reviews", href: "/logbook-review", icon: ClipboardList },
      { label: "Defense Schedule", href: "/defense", icon: Calendar },
      { label: "Profile", href: "/profile", icon: Settings },
    ],
  },
  industrySupervisor: {
    label: "Industry Supervisor",
    icon: Building2,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Assigned Students", href: "/students", icon: Users },
      { label: "Weekly Reviews", href: "/logbook-review", icon: BookText },
      { label: "Company Profile", href: "/profile", icon: Briefcase },
    ],
  },
  siwesCoordinator: {
    label: "SIWES Coordinator",
    icon: Shield,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Verification Codes", href: "/verification-codes", icon: Shield },
      { label: "All Students", href: "/students", icon: Users },
      { label: "Assignments", href: "/assignments", icon: ClipboardList },
      { label: "Defense Management", href: "/defense-management", icon: Calendar },
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  hod: {
    label: "Head of Department",
    icon: Users,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Department Students", href: "/students", icon: GraduationCap },
      { label: "Supervisors", href: "/supervisors", icon: UserCheck },
      { label: "Assignments", href: "/assignments", icon: ClipboardList },
      { label: "Defense Overview", href: "/defense", icon: Calendar },
      { label: "Department Reports", href: "/reports", icon: BarChart3 },
    ],
  },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 shadow-xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">InternTrack</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {config.navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform",
                    !isActive && "group-hover:scale-110"
                  )} />
                  {item.label}
                  {isActive && (
                    <Sparkles className="w-4 h-4 ml-auto opacity-70" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border bg-gradient-to-b from-transparent to-accent/30">
            <div className="flex items-center gap-3 p-3 bg-card border border-border/50">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-sm font-semibold">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.fullName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{config.label}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                  {(() => {
                    const currentItem = config.navItems.find((item) => item.href === location.pathname);
                    if (currentItem) {
                      const Icon = currentItem.icon;
                      return <Icon className="w-4 h-4 text-primary" />;
                    }
                    return <LayoutDashboard className="w-4 h-4 text-primary" />;
                  })()}
                </div>
                <h1 className="text-lg font-semibold text-foreground">
                  {config.navItems.find((item) => item.href === location.pathname)?.label || "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-card animate-pulse" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 pr-2 hover:bg-accent">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xs font-semibold">
                        {getInitials(user?.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{user?.fullName || "User"}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2">
                  <div className="px-3 py-2 bg-gradient-to-r from-primary/5 to-secondary/5 mb-2">
                    <p className="text-sm font-medium">{user?.fullName || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                  </div>
                  <DropdownMenuItem className="py-2.5 cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="py-2.5 text-destructive cursor-pointer hover:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;