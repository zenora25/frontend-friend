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
  X,
  ChevronDown,
  Bell,
  Shield,
  UserCheck,
  Building2,
  Sparkles,
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

// Mock user data - in real app, this would come from auth context
const mockUser = {
  name: "John Doe",
  email: "john.doe@baze.edu.ng",
  role: "student" as const,
  avatar: "JD",
};

const roleConfig = {
  student: {
    label: "Student",
    icon: BookOpen,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Logbook", href: "/logbook", icon: BookText },
      { label: "Defense", href: "/defense", icon: Calendar },
    ],
  },
  supervisor: {
    label: "Supervisor",
    icon: UserCheck,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Student Logbooks", href: "/logbooks", icon: BookText },
      { label: "Defense Schedule", href: "/defense", icon: Calendar },
    ],
  },
  industry_supervisor: {
    label: "Industry Supervisor",
    icon: Building2,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Student Progress", href: "/students", icon: Users },
      { label: "Weekly Reviews", href: "/reviews", icon: BookText },
    ],
  },
  coordinator: {
    label: "Coordinator",
    icon: Shield,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Verification Codes", href: "/verification-codes", icon: Shield },
      { label: "Students", href: "/students", icon: Users },
      { label: "Defense Management", href: "/defense-management", icon: Calendar },
    ],
  },
  hod: {
    label: "Head of Department",
    icon: Users,
    navItems: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Students", href: "/students", icon: Users },
      { label: "Supervisors", href: "/supervisors", icon: UserCheck },
      { label: "Reports", href: "/reports", icon: BookText },
    ],
  },
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const config = roleConfig[mockUser.role];

  const handleLogout = () => {
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
                  {mockUser.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{mockUser.name}</p>
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
                        {mockUser.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">{mockUser.name}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2">
                  <div className="px-3 py-2 bg-gradient-to-r from-primary/5 to-secondary/5 mb-2">
                    <p className="text-sm font-medium">{mockUser.name}</p>
                    <p className="text-xs text-muted-foreground">{mockUser.email}</p>
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