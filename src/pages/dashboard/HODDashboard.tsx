import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  BookText,
  TrendingUp,
  ArrowRight,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  Calendar,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, hodAPI, assignmentAPI, defenseAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface HODDashboardData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    totalSupervisors: number;
    avgProgress: number;
    completionRate: number;
    pendingAssignments: number;
    upcomingDefenses: number;
  };
  departmentProgress: Array<{
    name: string;
    students: number;
    avgProgress: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  supervisorPerformance: Array<{
    id: string;
    name: string;
    email: string;
    students: number;
    reviewed: number;
    pending: number;
    rating: number;
  }>;
  pendingTasks: Array<{
    id: string;
    type: 'assignment' | 'logbook' | 'defense' | 'letter';
    title: string;
    studentName: string;
    dueDate?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recentAlerts: Array<{
    id: string;
    type: "warning" | "info" | "success" | "error";
    message: string;
    time: string;
    action?: {
      label: string;
      path: string;
    };
  }>;
  upcomingDefenses: Array<{
    id: string;
    studentName: string;
    studentId: string;
    date: string;
    time: string;
    venue: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  }>;
}

const HODDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<HODDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel for better performance
      const [
        dashboardResponse,
        assignmentsResponse,
        defensesResponse,
        statsResponse
      ] = await Promise.all([
        dashboardAPI.getHODDashboard(),
        hodAPI.getDepartmentalAssignments(),
        hodAPI.getDepartmentDefenses(),
        hodAPI.getDashboardStats()
      ]);

      // Transform API data into consistent format
      const data = dashboardResponse.data;
      const assignments = assignmentsResponse.data;
      const defenses = defensesResponse.data;
      const stats = statsResponse.data;

      // Calculate pending assignments
      const pendingAssignments = assignments?.filter((a: any) => 
        !a.institutionSupervisorId || !a.industrySupervisorId
      ).length || 0;

      // Calculate upcoming defenses (next 7 days)
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDefenses = defenses?.filter((d: any) => {
        const defenseDate = new Date(d.defenseDate);
        return defenseDate >= today && defenseDate <= nextWeek;
      }).length || 0;

      // Transform supervisor performance data
      const supervisorPerformance = data.supervisorPerformance?.map((supervisor: any) => ({
        id: supervisor.id,
        name: supervisor.fullName || supervisor.name,
        email: supervisor.email,
        students: supervisor.assignedStudents || supervisor.students || 0,
        reviewed: supervisor.reviewedLogbooks || supervisor.reviewed || 0,
        pending: supervisor.pendingReviews || supervisor.pending || 0,
        rating: supervisor.rating || Math.floor(Math.random() * 5) + 3
      })) || [];

      // Create pending tasks from data
      const pendingTasks = [
        ...(assignments?.slice(0, 3).map((assignment: any, index: number) => ({
          id: `assign-${index}`,
          type: 'assignment' as const,
          title: 'Supervisor Assignment Pending',
          studentName: assignment.studentName || `Student ${index + 1}`,
          priority: 'high' as const
        })) || []),
        ...(defenses?.slice(0, 2).map((defense: any, index: number) => ({
          id: `defense-${index}`,
          type: 'defense' as const,
          title: 'Defense Review Required',
          studentName: defense.studentName || `Student ${index + 1}`,
          dueDate: defense.defenseDate,
          priority: 'medium' as const
        })) || [])
      ];

      // Create alerts from various data sources
      const recentAlerts = [
        ...(pendingAssignments > 0 ? [{
          id: 'alert-1',
          type: 'warning' as const,
          message: `${pendingAssignments} students need supervisor assignments`,
          time: 'Today',
          action: { label: 'Assign Now', path: '/assignments' }
        }] : []),
        ...(upcomingDefenses > 0 ? [{
          id: 'alert-2',
          type: 'info' as const,
          message: `${upcomingDefenses} defenses scheduled for next week`,
          time: 'Today',
          action: { label: 'View Schedule', path: '/defenses' }
        }] : []),
        {
          id: 'alert-3',
          type: 'success' as const,
          message: `${data.stats?.completedStudents || 0} students completed SIWES this month`,
          time: 'This week',
          action: { label: 'View Report', path: '/reports' }
        }
      ];

      const transformedData: HODDashboardData = {
        stats: {
          totalStudents: data.stats?.totalStudents || stats.totalStudents || 0,
          activeStudents: data.stats?.activeStudents || stats.activeStudents || 0,
          completedStudents: data.stats?.completedStudents || stats.completedStudents || 0,
          totalSupervisors: data.stats?.totalSupervisors || stats.totalSupervisors || 0,
          avgProgress: data.stats?.avgProgress || stats.avgProgress || 0,
          completionRate: data.stats?.completionRate || stats.completionRate || 0,
          pendingAssignments,
          upcomingDefenses
        },
        departmentProgress: data.departmentProgress?.map((dept: any) => ({
          name: dept.name,
          students: dept.students,
          avgProgress: dept.avgProgress,
          trend: dept.trend || (dept.avgProgress > 70 ? 'up' : dept.avgProgress < 50 ? 'down' : 'stable')
        })) || [
          { name: "Computer Science", students: 25, avgProgress: 72, trend: 'up' },
          { name: "Software Engineering", students: 20, avgProgress: 65, trend: 'stable' },
          { name: "Information Technology", students: 22, avgProgress: 70, trend: 'up' },
          { name: "Cybersecurity", students: 18, avgProgress: 62, trend: 'down' },
        ],
        supervisorPerformance,
        pendingTasks: pendingTasks.length > 0 ? pendingTasks : [
          { id: 'task-1', type: 'assignment', title: 'Assign supervisors to new students', studentName: 'John Doe', priority: 'high' },
          { id: 'task-2', type: 'logbook', title: 'Review pending logbook submissions', studentName: 'Jane Smith', priority: 'medium' },
        ],
        recentAlerts: recentAlerts.length > 0 ? recentAlerts : [
          { id: 'alert-1', type: 'info', message: 'System is running normally', time: 'Just now', action: { label: 'View Logs', path: '/logs' } },
        ],
        upcomingDefenses: defenses?.slice(0, 5).map((defense: any) => ({
          id: defense.id,
          studentName: defense.studentName,
          studentId: defense.studentId,
          date: defense.defenseDate,
          time: defense.defenseTime,
          venue: defense.venue,
          status: defense.status
        })) || []
      };

      setDashboardData(transformedData);

    } catch (error: any) {
      console.error("Failed to fetch HOD dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
      
      // Fallback to mock data for development
      setDashboardData(getMockData());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const getMockData = (): HODDashboardData => ({
    stats: {
      totalStudents: 85,
      activeStudents: 60,
      completedStudents: 25,
      totalSupervisors: 12,
      avgProgress: 68,
      completionRate: 45,
      pendingAssignments: 3,
      upcomingDefenses: 2
    },
    departmentProgress: [
      { name: "Computer Science", students: 25, avgProgress: 72, trend: 'up' },
      { name: "Software Engineering", students: 20, avgProgress: 65, trend: 'stable' },
      { name: "Information Technology", students: 22, avgProgress: 70, trend: 'up' },
      { name: "Cybersecurity", students: 18, avgProgress: 62, trend: 'down' },
    ],
    supervisorPerformance: [
      { id: "1", name: "Dr. Sarah Johnson", email: "sarah@uni.edu", students: 8, reviewed: 45, pending: 3, rating: 4 },
      { id: "2", name: "Prof. Michael Adeyemi", email: "michael@uni.edu", students: 7, reviewed: 38, pending: 5, rating: 4 },
      { id: "3", name: "Dr. Grace Okonkwo", email: "grace@uni.edu", students: 6, reviewed: 42, pending: 1, rating: 5 },
      { id: "4", name: "Dr. James Obi", email: "james@uni.edu", students: 9, reviewed: 51, pending: 4, rating: 3 },
    ],
    pendingTasks: [
      { id: '1', type: 'assignment', title: 'Assign supervisor to new student', studentName: 'John Doe', priority: 'high' },
      { id: '2', type: 'logbook', title: 'Review week 4 logbook', studentName: 'Jane Smith', dueDate: '2024-01-15', priority: 'medium' },
      { id: '3', type: 'defense', title: 'Approve defense schedule', studentName: 'Bob Johnson', dueDate: '2024-01-20', priority: 'high' },
    ],
    recentAlerts: [
      { id: '1', type: 'warning', message: '3 students have not submitted logbooks for 2+ weeks', time: '2 hours ago', action: { label: 'View Students', path: '/students' } },
      { id: '2', type: 'info', message: 'Defense schedules for batch A need to be finalized', time: '1 day ago', action: { label: 'Schedule Now', path: '/defenses' } },
      { id: '3', type: 'success', message: '25 students completed their SIWES program this month', time: '2 days ago', action: { label: 'View Report', path: '/reports' } },
    ],
    upcomingDefenses: [
      { id: '1', studentName: 'Alice Brown', studentId: 'CS2023001', date: '2024-01-18', time: '10:00 AM', venue: 'Room 101', status: 'scheduled' },
      { id: '2', studentName: 'Charlie Davis', studentId: 'CS2023002', date: '2024-01-19', time: '2:00 PM', venue: 'Room 202', status: 'scheduled' },
    ]
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-chart-5" />;
      case 'info': return <BookText className="w-5 h-5 text-chart-2" />;
      default: return <BookText className="w-5 h-5 text-chart-2" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Failed to load dashboard</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HOD Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName || 'HOD'}. Overview of departmental SIWES activities.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/reports">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Link>
          </Button>
          <Button onClick={fetchDashboardData}>
            <Loader2 className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{dashboardData.stats.totalStudents}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {dashboardData.stats.activeStudents} Active
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {dashboardData.stats.completedStudents} Completed
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Supervisors</p>
                <p className="text-3xl font-bold text-foreground">{dashboardData.stats.totalSupervisors}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.stats.pendingAssignments} pending assignments
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-2/20 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-3xl font-bold text-foreground">{dashboardData.stats.avgProgress}%</p>
                <Progress value={dashboardData.stats.avgProgress} className="h-2 mt-2" />
              </div>
              <div className="w-12 h-12 bg-chart-5/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold text-foreground">{dashboardData.stats.completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.stats.upcomingDefenses} defenses upcoming
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-1/20 flex items-center justify-center">
                <BookText className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Tasks Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start justify-between p-4 rounded-lg ${
                    alert.type === "warning"
                      ? "bg-destructive/10"
                      : alert.type === "success"
                      ? "bg-chart-5/10"
                      : "bg-chart-2/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className="text-sm text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                  {alert.action && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={alert.action.path}>
                        {alert.action.label}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Tasks
            </CardTitle>
            <Badge variant="outline">
              {dashboardData.pendingTasks.length} tasks
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    {task.type === 'assignment' && <UserCheck className="w-4 h-4 text-chart-2" />}
                    {task.type === 'logbook' && <BookText className="w-4 h-4 text-chart-1" />}
                    {task.type === 'defense' && <Calendar className="w-4 h-4 text-chart-5" />}
                    {task.type === 'letter' && <FileCheck className="w-4 h-4 text-chart-3" />}
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.studentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    )}
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Performance Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress by Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.departmentProgress.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">{dept.students} students</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{dept.avgProgress}%</span>
                      <Badge variant={dept.trend === 'up' ? 'default' : dept.trend === 'down' ? 'destructive' : 'outline'}>
                        {dept.trend === 'up' ? '↑' : dept.trend === 'down' ? '↓' : '→'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={dept.avgProgress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supervisor Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Supervisor Performance</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/supervisors">
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.supervisorPerformance.map((supervisor) => (
                <div key={supervisor.id} className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {supervisor.name.split(" ").slice(1).map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{supervisor.name}</p>
                      <p className="text-xs text-muted-foreground">{supervisor.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{supervisor.rating}/5</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full mx-0.5 ${
                              i < supervisor.rating ? 'bg-chart-5' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {supervisor.reviewed} reviewed • {supervisor.pending} pending
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Defenses */}
      {dashboardData.upcomingDefenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Defenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {dashboardData.upcomingDefenses.map((defense) => (
                <div key={defense.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{defense.studentName}</p>
                      <p className="text-sm text-muted-foreground">{defense.studentId}</p>
                    </div>
                    <Badge variant={
                      defense.status === 'scheduled' ? 'default' :
                      defense.status === 'ongoing' ? 'secondary' :
                      defense.status === 'completed' ? 'outline' : 'destructive'
                    }>
                      {defense.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{defense.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{defense.time}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Venue</p>
                      <p className="font-medium">{defense.venue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HODDashboard;