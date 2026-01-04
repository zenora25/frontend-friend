import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookText,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  MessageSquare,
  Eye,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, assignmentAPI, logbookAPI } from "@/lib/api";

interface IndustryDashboardData {
  stats: {
    assignedStudents: number;
    pendingReviews: number;
    reviewedThisWeek: number;
    avgRating: number;
  };
  students: Array<{
    id: number;
    name: string;
    matricNumber: string;
    role: string;
    progress: number;
    lastActivity: string;
    status: "active" | "inactive";
  }>;
  recentSubmissions: Array<{
    id: number;
    student: string;
    week: number;
    submittedAt: string;
    status: "pending" | "reviewed";
    preview: string;
  }>;
}

const IndustrySupervisorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<IndustryDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, studentsRes] = await Promise.all([
        dashboardAPI.getSupervisorDashboard(),
        assignmentAPI.getSupervisorStudents(),
      ]);

      const data = dashboardRes.data;
      const assignedStudents = studentsRes.data || [];

      const transformedData: IndustryDashboardData = {
        stats: {
          assignedStudents: data.stats?.assignedStudents || assignedStudents.length,
          pendingReviews: data.stats?.pendingReviews || 3,
          reviewedThisWeek: data.stats?.reviewedThisWeek || 8,
          avgRating: 4.2,
        },
        students: assignedStudents.slice(0, 3).map((student: any, index: number) => ({
          id: student.id,
          name: student.fullName,
          matricNumber: student.matricNumber,
          role: "Software Developer Intern",
          progress: student.progress || 0,
          lastActivity: "2024-03-11",
          status: index === 2 ? "inactive" : "active",
        })),
        recentSubmissions: [
          {
            id: 1,
            student: "John Doe",
            week: 8,
            submittedAt: "2024-03-11",
            status: "pending",
            preview: "Worked on implementing REST API endpoints for user management...",
          },
          {
            id: 2,
            student: "Jane Smith",
            week: 8,
            submittedAt: "2024-03-10",
            status: "pending",
            preview: "Completed data visualization dashboard using Python and Tableau...",
          },
          {
            id: 3,
            student: "Mike Johnson",
            week: 7,
            submittedAt: "2024-03-04",
            status: "reviewed",
            preview: "Conducted regression testing on payment module...",
          },
        ],
      };

      setDashboardData(transformedData);
    } catch (error) {
      console.error("Failed to fetch industry supervisor dashboard data:", error);
      // Fallback to mock data
      setDashboardData({
        stats: {
          assignedStudents: 5,
          pendingReviews: 3,
          reviewedThisWeek: 8,
          avgRating: 4.2,
        },
        students: [
          {
            id: 1,
            name: "John Doe",
            matricNumber: "BU/23A/IT/8002",
            role: "Software Developer Intern",
            progress: 75,
            lastActivity: "2024-03-11",
            status: "active",
          },
          {
            id: 2,
            name: "Jane Smith",
            matricNumber: "BU/23A/CS/8015",
            role: "Data Analyst Intern",
            progress: 68,
            lastActivity: "2024-03-10",
            status: "active",
          },
          {
            id: 3,
            name: "Mike Johnson",
            matricNumber: "BU/23A/SE/8008",
            role: "QA Tester Intern",
            progress: 45,
            lastActivity: "2024-03-05",
            status: "inactive",
          },
        ],
        recentSubmissions: [
          {
            id: 1,
            student: "John Doe",
            week: 8,
            submittedAt: "2024-03-11",
            status: "pending",
            preview: "Worked on implementing REST API endpoints for user management...",
          },
          {
            id: 2,
            student: "Jane Smith",
            week: 8,
            submittedAt: "2024-03-10",
            status: "pending",
            preview: "Completed data visualization dashboard using Python and Tableau...",
          },
          {
            id: 3,
            student: "Mike Johnson",
            week: 7,
            submittedAt: "2024-03-04",
            status: "reviewed",
            preview: "Conducted regression testing on payment module...",
          },
        ],
      });
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-foreground">Industry Supervisor Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and provide feedback on intern progress at your organization.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Interns</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.assignedStudents}</p>
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
                  <p className="text-sm text-muted-foreground">Reviewed This Week</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.reviewedThisWeek}</p>
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
                  <p className="text-sm text-muted-foreground">Avg. Rating Given</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.avgRating}</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assigned interns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Assigned Interns</CardTitle>
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
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.role}</p>
                          </div>
                        </div>
                        <Badge
                            variant="secondary"
                            className={
                              student.status === "active"
                                  ? "bg-chart-5/20 text-chart-5"
                                  : "bg-muted text-muted-foreground"
                            }
                        >
                          {student.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">SIWES Progress</span>
                          <span className="font-medium">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>
                      <p className="text-xs text-muted-foreground">Last activity: {student.lastActivity}</p>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Submissions to Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 bg-accent space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{submission.student}</p>
                          <p className="text-xs text-muted-foreground">
                            Week {submission.week} • {submission.submittedAt}
                          </p>
                        </div>
                        <Badge
                            variant="secondary"
                            className={
                              submission.status === "pending"
                                  ? "bg-chart-1/20 text-chart-1"
                                  : "bg-chart-5/20 text-chart-5"
                            }
                        >
                          {submission.status === "pending" ? (
                              <Clock className="w-3 h-3 mr-1" />
                          ) : (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{submission.preview}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
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
        </div>
      </div>
  );
};

export default IndustrySupervisorDashboard;