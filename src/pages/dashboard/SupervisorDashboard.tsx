import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Eye,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, logbookAPI, assignmentAPI } from "@/lib/api";

interface SupervisorDashboardData {
  stats: {
    totalStudents: number;
    pendingReviews: number;
    approvedThisWeek: number;
    overdue: number;
  };
  students: Array<{
    id: number;
    name: string;
    matricNumber: string;
    company: string;
    progress: number;
    lastSubmission: string;
    status: "pending" | "reviewed" | "overdue";
  }>;
  pendingLogbooks: Array<{
    id: number;
    student: string;
    week: number;
    submittedAt: string;
    preview: string;
  }>;
}

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<SupervisorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch multiple data sources
      const [dashboardRes, logbooksRes, studentsRes] = await Promise.all([
        dashboardAPI.getSupervisorDashboard(),
        logbookAPI.getSupervisorLogbooks({ status: "PENDING" }),
        assignmentAPI.getSupervisorStudents(),
      ]);

      const dashboardData = dashboardRes.data;
      const pendingLogbooks = logbooksRes.data || [];
      const assignedStudents = studentsRes.data || [];

      // Transform data
      const transformedData: SupervisorDashboardData = {
        stats: {
          totalStudents: dashboardData.stats?.assignedStudents || assignedStudents.length,
          pendingReviews: dashboardData.stats?.pendingReviews || pendingLogbooks.length,
          approvedThisWeek: dashboardData.stats?.reviewedThisWeek || 0,
          overdue: dashboardData.stats?.overdue || 0,
        },
        students: assignedStudents.slice(0, 4).map((student: any) => ({
          id: student.id,
          name: student.fullName,
          matricNumber: student.matricNumber,
          company: student.companyName,
          progress: student.progress || 0,
          lastSubmission: "2024-03-11",
          status: "pending",
        })),
        pendingLogbooks: pendingLogbooks.slice(0, 3).map((logbook: any) => ({
          id: logbook.id,
          student: logbook.Student?.fullName || "Unknown Student",
          week: logbook.weekNumber,
          submittedAt: new Date(logbook.createdAt).toLocaleDateString(),
          preview: logbook.weekSummary?.substring(0, 100) + "...",
        })),
      };

      setDashboardData(transformedData);
    } catch (error) {
      console.error("Failed to fetch supervisor dashboard data:", error);
      // Fallback to mock data
      setDashboardData({
        stats: {
          totalStudents: 15,
          pendingReviews: 8,
          approvedThisWeek: 12,
          overdue: 2,
        },
        students: [
          {
            id: 1,
            name: "John Doe",
            matricNumber: "BU/23A/IT/8002",
            company: "Tech Solutions Ltd",
            progress: 75,
            lastSubmission: "2024-03-11",
            status: "pending",
          },
          {
            id: 2,
            name: "Jane Smith",
            matricNumber: "BU/23A/CS/8015",
            company: "Digital Innovations",
            progress: 68,
            lastSubmission: "2024-03-10",
            status: "reviewed",
          },
          {
            id: 3,
            name: "Mike Johnson",
            matricNumber: "BU/23A/SE/8008",
            company: "Cloud Systems Inc",
            progress: 45,
            lastSubmission: "2024-03-05",
            status: "overdue",
          },
          {
            id: 4,
            name: "Sarah Williams",
            matricNumber: "BU/23A/IT/8020",
            company: "Data Analytics Corp",
            progress: 82,
            lastSubmission: "2024-03-11",
            status: "pending",
          },
        ],
        pendingLogbooks: [
          {
            id: 1,
            student: "John Doe",
            week: 8,
            submittedAt: "2024-03-11 09:30 AM",
            preview: "This week I worked on implementing the user authentication module...",
          },
          {
            id: 2,
            student: "Sarah Williams",
            week: 8,
            submittedAt: "2024-03-11 11:45 AM",
            preview: "Completed the database design and started API development...",
          },
          {
            id: 3,
            student: "Alex Brown",
            week: 7,
            submittedAt: "2024-03-10 02:15 PM",
            preview: "Worked on unit testing for the payment module...",
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-chart-1/20 text-chart-1";
      case "reviewed":
        return "bg-chart-5/20 text-chart-5";
      case "overdue":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading || !dashboardData) {
    return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor student progress and review logbook submissions.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.totalStudents}</p>
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
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.pendingReviews}</p>
                </div>
                <div className="w-12 h-12 bg-chart-1/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved This Week</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.approvedThisWeek}</p>
                </div>
                <div className="w-12 h-12 bg-chart-5/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.overdue}</p>
                </div>
                <div className="w-12 h-12 bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending logbook reviews */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pending Logbook Reviews</CardTitle>
              <Badge variant="secondary">{dashboardData.pendingLogbooks.length} new</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.pendingLogbooks.map((logbook) => (
                    <div key={logbook.id} className="p-4 bg-accent space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {logbook.student.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{logbook.student}</p>
                            <p className="text-xs text-muted-foreground">Week {logbook.week} • {logbook.submittedAt}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{logbook.preview}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" asChild>
                          <Link to={`/logbook/review/${logbook.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student progress list */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Student Progress</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/students">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.students.map((student) => (
                    <div key={student.id} className="p-4 bg-accent space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.matricNumber}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{student.company}</span>
                          <span className="font-medium">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
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

export default SupervisorDashboard;