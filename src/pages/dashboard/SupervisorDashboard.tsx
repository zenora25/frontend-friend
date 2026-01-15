
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  RefreshCw,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { institutionSupervisorAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SupervisorDashboardData {
  supervisor: {
    id: number;
    fullName: string;
    email: string;
    department: string;
  };
  stats: {
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    totalLogbooks: number;
    pendingLogbooks: number;
    approvedLogbooks: number;
    revisionLogbooks: number;
    approvalRate: number;
    avgResponseTime: number;
    completionRate: number;
  };
  studentProgress: Array<{
    id: number;
    name: string;
    matricNumber: string;
    company: string;
    progress: number;
    status: string;
    lastActivity: string;
    pendingLogbooks: number;
  }>;
  recentLogbookSubmissions: Array<{
    id: number;
    studentId: number;
    studentName: string;
    studentMatric: string;
    weekNumber: number;
    title: string;
    submittedAt: string;
    status: string;
  }>;
  performanceMetrics: {
    responseEfficiency: number;
    reviewCompleteness: number;
    studentSatisfaction: number;
    engagementLevel: number;
  };
}

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<SupervisorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await institutionSupervisorAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch supervisor dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });

      // Fallback to mock data for development
      setDashboardData({
        supervisor: {
          id: 1,
          fullName: user?.fullName || "Dr. Supervisor",
          email: user?.email || "supervisor@baze.edu.ng",
          department: user?.department || "Computer Science"
        },
        stats: {
          totalStudents: 15,
          activeStudents: 12,
          completedStudents: 3,
          totalLogbooks: 85,
          pendingLogbooks: 8,
          approvedLogbooks: 72,
          revisionLogbooks: 5,
          approvalRate: 85,
          avgResponseTime: 1.5,
          completionRate: 20
        },
        studentProgress: [
          {
            id: 1,
            name: "John Doe",
            matricNumber: "BU/23A/IT/8002",
            company: "Tech Solutions Ltd",
            progress: 75,
            status: "ACTIVE",
            lastActivity: "2024-03-11",
            pendingLogbooks: 2
          },
          {
            id: 2,
            name: "Jane Smith",
            matricNumber: "BU/23A/CS/8015",
            company: "Digital Innovations",
            progress: 68,
            status: "ACTIVE",
            lastActivity: "2024-03-10",
            pendingLogbooks: 1
          },
          {
            id: 3,
            name: "Mike Johnson",
            matricNumber: "BU/23A/SE/8008",
            company: "Cloud Systems Inc",
            progress: 45,
            status: "ACTIVE",
            lastActivity: "2024-03-05",
            pendingLogbooks: 3
          },
          {
            id: 4,
            name: "Sarah Williams",
            matricNumber: "BU/23A/IT/8020",
            company: "Data Analytics Corp",
            progress: 82,
            status: "ACTIVE",
            lastActivity: "2024-03-11",
            pendingLogbooks: 1
          },
        ],
        recentLogbookSubmissions: [
          {
            id: 1,
            studentId: 1,
            studentName: "John Doe",
            studentMatric: "BU/23A/IT/8002",
            weekNumber: 8,
            title: "API Development & Testing",
            submittedAt: "2024-03-11 09:30 AM",
            status: "PENDING"
          },
          {
            id: 2,
            studentId: 4,
            studentName: "Sarah Williams",
            studentMatric: "BU/23A/IT/8020",
            weekNumber: 8,
            title: "Database Optimization",
            submittedAt: "2024-03-11 11:45 AM",
            status: "PENDING"
          },
          {
            id: 3,
            studentId: 3,
            studentName: "Mike Johnson",
            studentMatric: "BU/23A/SE/8008",
            weekNumber: 7,
            title: "Unit Testing Implementation",
            submittedAt: "2024-03-10 02:15 PM",
            status: "PENDING"
          },
        ],
        performanceMetrics: {
          responseEfficiency: 85,
          reviewCompleteness: 90,
          studentSatisfaction: 85,
          engagementLevel: 80
        }
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleReviewLogbook = (logbookId: number) => {
    navigate(`/dashboard/logbook/${logbookId}/review`);
  };

  const handleViewStudent = (studentId: number) => {
    navigate(`/dashboard/students/${studentId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Unable to load dashboard</h2>
        <p className="text-gray-600 mb-4">There was an error loading your dashboard data.</p>
        <Button onClick={fetchDashboardData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {dashboardData.supervisor.fullName}. Monitor student progress and review logbook submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link to="/dashboard/students">
              View All Students
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="reviews">Pending Reviews</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold text-foreground">{dashboardData?.stats?.totalStudents || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {dashboardData?.stats?.activeStudents || 0} active • {dashboardData?.stats?.completedStudents || 0} completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    <p className="text-3xl font-bold text-foreground">{dashboardData?.stats?.pendingLogbooks || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-chart-1/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-chart-1" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {dashboardData?.stats?.avgResponseTime || 0} days avg. response time
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                    <p className="text-3xl font-bold text-foreground">{dashboardData?.stats?.approvalRate || 0}%</p>
                  </div>
                  <div className="w-12 h-12 bg-chart-5/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-chart-5" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {dashboardData?.stats?.approvedLogbooks || 0} of {dashboardData?.stats?.totalLogbooks || 0} approved
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-3xl font-bold text-foreground">{dashboardData?.stats?.completionRate || 0}%</p>
                  </div>
                  <div className="w-12 h-12 bg-chart-2/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-chart-2" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {dashboardData?.stats?.completedStudents || 0} students completed
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pending logbook reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Pending Logbook Reviews</CardTitle>
                <Badge variant="secondary">{dashboardData.recentLogbookSubmissions.length} new</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentLogbookSubmissions.slice(0, 3).map((logbook) => (
                    <div key={logbook.id} className="p-4 bg-accent space-y-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {logbook.studentName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{logbook.studentName}</p>
                            <p className="text-xs text-muted-foreground">Week {logbook.weekNumber} • {logbook.submittedAt}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{logbook.title}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReviewLogbook(logbook.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewStudent(logbook.studentId)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {dashboardData.recentLogbookSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No pending logbook reviews</p>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/dashboard/logbook-review">
                        View All Pending Reviews
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student progress list */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Student Progress</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/students">
                    View all
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.studentProgress.slice(0, 4).map((student) => (
                    <div key={student.id} className="p-4 bg-accent space-y-3 rounded-lg">
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
                        {getStatusBadge(student.status)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{student.company}</span>
                          <span className="font-medium">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Last activity: {new Date(student.lastActivity).toLocaleDateString()}</span>
                        {student.pendingLogbooks > 0 && (
                          <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                            {student.pendingLogbooks} pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.studentProgress.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">{student.matricNumber} • {student.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{student.progress}%</div>
                          <Progress value={student.progress} className="w-24" />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewStudent(student.id)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Pending Logbook Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentLogbookSubmissions.map((logbook) => (
                  <div key={logbook.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{logbook.studentName}</h3>
                        <p className="text-sm text-muted-foreground">Week {logbook.weekNumber} • Submitted {logbook.submittedAt}</p>
                      </div>
                      <Badge variant="secondary" className="bg-chart-1/20 text-chart-1">
                        Pending Review
                      </Badge>
                    </div>
                    <p className="mb-3">{logbook.title}</p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewStudent(logbook.studentId)}>
                        View Student
                      </Button>
                      <Button size="sm" onClick={() => handleReviewLogbook(logbook.id)}>
                        Review Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Response Efficiency</span>
                      <span className="text-sm font-medium">{dashboardData.performanceMetrics.responseEfficiency}%</span>
                    </div>
                    <Progress value={dashboardData.performanceMetrics.responseEfficiency} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Review Completeness</span>
                      <span className="text-sm font-medium">{dashboardData.performanceMetrics.reviewCompleteness}%</span>
                    </div>
                    <Progress value={dashboardData.performanceMetrics.reviewCompleteness} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Student Engagement</span>
                      <span className="text-sm font-medium">{dashboardData.performanceMetrics.engagementLevel}%</span>
                    </div>
                    <Progress value={dashboardData.performanceMetrics.engagementLevel} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Student Satisfaction</span>
                      <span className="text-sm font-medium">{dashboardData.performanceMetrics.studentSatisfaction}%</span>
                    </div>
                    <Progress value={dashboardData.performanceMetrics.studentSatisfaction} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Logbooks</p>
                      <p className="text-2xl font-bold">{dashboardData.stats.totalLogbooks}</p>
                    </div>
                    <BookText className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold">{dashboardData.stats.approvedLogbooks}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{dashboardData.stats.pendingLogbooks}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                      <p className="text-2xl font-bold">{dashboardData.stats.avgResponseTime} days</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupervisorDashboard;
