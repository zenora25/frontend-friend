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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockData = {
  stats: {
    totalStudents: 85,
    totalSupervisors: 12,
    avgProgress: 68,
    completionRate: 45,
  },
  departmentProgress: [
    { name: "Computer Science", students: 25, avgProgress: 72 },
    { name: "Software Engineering", students: 20, avgProgress: 65 },
    { name: "Information Technology", students: 22, avgProgress: 70 },
    { name: "Cybersecurity", students: 18, avgProgress: 62 },
  ],
  supervisorPerformance: [
    { id: 1, name: "Dr. Sarah Johnson", students: 8, reviewed: 45, pending: 3 },
    { id: 2, name: "Prof. Michael Adeyemi", students: 7, reviewed: 38, pending: 5 },
    { id: 3, name: "Dr. Grace Okonkwo", students: 6, reviewed: 42, pending: 1 },
    { id: 4, name: "Dr. James Obi", students: 9, reviewed: 51, pending: 4 },
  ],
  alerts: [
    { id: 1, type: "warning", message: "5 students have not submitted logbooks for 2+ weeks", action: "View Students" },
    { id: 2, type: "info", message: "Defense schedules for batch A need to be finalized", action: "Schedule Now" },
    { id: 3, type: "success", message: "25 students completed their SIWES program this month", action: "View Report" },
  ],
};

const HODDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HOD Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of departmental SIWES activities and progress.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{mockData.stats.totalStudents}</p>
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
                <p className="text-3xl font-bold text-foreground">{mockData.stats.totalSupervisors}</p>
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
                <p className="text-3xl font-bold text-foreground">{mockData.stats.avgProgress}%</p>
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
                <p className="text-3xl font-bold text-foreground">{mockData.stats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-chart-1/20 flex items-center justify-center">
                <BookText className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {mockData.alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-4 ${
              alert.type === "warning"
                ? "bg-destructive/10 border border-destructive/20"
                : alert.type === "success"
                ? "bg-chart-5/10 border border-chart-5/20"
                : "bg-chart-2/10 border border-chart-2/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {alert.type === "warning" ? (
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              ) : alert.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-chart-5 flex-shrink-0" />
              ) : (
                <BookText className="w-5 h-5 text-chart-2 flex-shrink-0" />
              )}
              <p className="text-sm text-foreground">{alert.message}</p>
            </div>
            <Button variant="ghost" size="sm">
              {alert.action}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress by Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.departmentProgress.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">{dept.students} students</p>
                    </div>
                    <span className="text-sm font-medium">{dept.avgProgress}%</span>
                  </div>
                  <Progress value={dept.avgProgress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supervisor performance */}
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
              {mockData.supervisorPerformance.map((supervisor) => (
                <div key={supervisor.id} className="flex items-center justify-between p-4 bg-accent">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {supervisor.name.split(" ").slice(1).map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{supervisor.name}</p>
                      <p className="text-xs text-muted-foreground">{supervisor.students} students assigned</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{supervisor.reviewed} reviewed</p>
                    <p className="text-xs text-muted-foreground">{supervisor.pending} pending</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HODDashboard;
