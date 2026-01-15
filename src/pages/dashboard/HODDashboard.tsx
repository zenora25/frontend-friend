
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  GraduationCap,
  BarChart3,
  FileText,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { hodAPI, studentAPI, institutionSupervisorAPI, defenseAPI, logbookAPI } from "@/lib/api";

interface HODDashboardData {
  hod: {
    id: string;
    fullName: string;
    email: string;
    department: string;
  };
  stats: {
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    institutionSupervisors: number;
    totalLogbooks: number;
    pendingLogbooks: number;
    approvedLogbooks: number;
    totalDefenses: number;
    scheduledDefenses: number;
    avgProgress: number;
    completionRate: number;
    approvalRate: number;
  };
  recentActivities: {
    logbooks: Array<{
      id: string;
      studentName: string;
      studentMatric: string;
      weekNumber: number;
      title: string;
      status: string;
      submittedAt: string;
    }>;
    upcomingDefenses: Array<{
      id: string;
      studentName: string;
      studentMatric: string;
      defenseDate: string;
      defenseTime: string;
      venue: string;
    }>;
  };
  supervisorPerformance: Array<{
    id: string;
    name: string;
    email: string;
    studentsAssigned: number;
    logbooksReviewed: number;
    logbooksPending: number;
    reviewRate: number;
  }>;
  departmentProgress: {
    current: number;
    target: number;
    remaining: number;
  };
}

interface Student {
  id: string;
  fullName: string;
  matricNumber: string;
  email: string;
  department: string;
  companyName: string;
  progress: number;
  status: string;
  Supervisor?: {
    fullName: string;
    email: string;
  };
  IndustrySupervisor?: {
    fullName: string;
    companyName: string;
  };
  Logbooks?: Array<{
    id: string;
    weekNumber: number;
    status: string;
    createdAt: string;
  }>;
}

const HODDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<HODDashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
  }, [currentPage, statusFilter, searchQuery]);

  const fetchDashboardData = async () => {
    try {
      const response = await hodAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch HOD dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await hodAPI.getDepartmentStudents(params);
      setStudents(response.data.students || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error: any) {
      console.error("Failed to fetch students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignSupervisor = (studentId: string) => {
    navigate("/dashboard/assign-students");
  };

  const handleViewStudent = (studentId: string) => {
    // For now, we go to the unified students list or a detail page if implemented
    navigate("/dashboard/students");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getLogbookStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVISION":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HOD Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {dashboardData?.hod.fullName || user?.fullName} •{" "}
            {dashboardData?.hod.department || user?.department}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData?.stats?.totalStudents || 0}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {dashboardData?.stats.activeStudents || 0} Active
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {dashboardData?.stats.completedStudents || 0} Completed
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
                <p className="text-sm text-muted-foreground">Department Progress</p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData?.stats?.avgProgress || 0}%
                </p>
                <div className="mt-2">
                  <Progress value={dashboardData?.stats?.avgProgress || 0} className="h-2" />
                </div>
              </div>
              <div className="w-12 h-12 bg-chart-2/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Logbooks</p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData?.stats?.pendingLogbooks || 0}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getLogbookStatusColor("PENDING")}`}
                  >
                    {dashboardData?.stats?.pendingLogbooks || 0} Pending
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 bg-chart-1/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Defenses</p>
                <p className="text-3xl font-bold text-foreground">
                  {dashboardData?.stats?.scheduledDefenses || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {dashboardData?.stats?.totalDefenses || 0} Total Defenses
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-3/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="supervisors">Supervisors</TabsTrigger>
          <TabsTrigger value="defenses">Defenses</TabsTrigger>
          <TabsTrigger value="logbooks">Logbooks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest student submissions and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.recentActivities.logbooks.slice(0, 5).map((logbook) => (
                    <div
                      key={logbook.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{logbook.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Week {logbook.weekNumber}: {logbook.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(logbook.submittedAt)}
                        </p>
                      </div>
                      <Badge className={getLogbookStatusColor(logbook.status)}>
                        {logbook.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Supervisor Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Supervisor Performance</CardTitle>
                <CardDescription>
                  Review rates and assigned students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.supervisorPerformance.slice(0, 5).map((supervisor) => (
                    <div
                      key={supervisor.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{supervisor.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {supervisor.studentsAssigned} Students
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {supervisor.logbooksReviewed} Reviewed
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{supervisor.reviewRate}%</p>
                        <p className="text-xs text-muted-foreground">Review Rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Defenses */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Defenses</CardTitle>
              <CardDescription>
                Scheduled defenses in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.recentActivities.upcomingDefenses.map((defense) => (
                    <TableRow key={defense.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{defense.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {defense.studentMatric}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(defense.defenseDate)}</p>
                          <p className="text-sm text-muted-foreground">
                            {defense.defenseTime}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{defense.venue}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          SCHEDULED
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Department Students</CardTitle>
                  <CardDescription>
                    Manage and monitor students in your department
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric Number</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.fullName}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.matricNumber}</TableCell>
                      <TableCell>{student.companyName || "Not assigned"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={student.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {student.progress}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.Supervisor ? (
                          <div>
                            <p className="font-medium">{student.Supervisor.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.Supervisor.email}
                            </p>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Not Assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewStudent(student.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAssignSupervisor(student.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {students.length} students
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supervisors Tab */}
        <TabsContent value="supervisors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supervisor Performance</CardTitle>
              <CardDescription>
                Track and manage institution supervisors in your department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Students Assigned</TableHead>
                    <TableHead>Logbooks Reviewed</TableHead>
                    <TableHead>Pending Reviews</TableHead>
                    <TableHead>Review Rate</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.supervisorPerformance.map((supervisor) => (
                    <TableRow key={supervisor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{supervisor.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{supervisor.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{supervisor.studentsAssigned}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {supervisor.logbooksReviewed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {supervisor.logbooksPending}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={supervisor.reviewRate} className="h-2" />
                          <p className="text-xs">{supervisor.reviewRate}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {supervisor.reviewRate >= 80 ? (
                          <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                        ) : supervisor.reviewRate >= 60 ? (
                          <Badge className="bg-blue-100 text-blue-800">Good</Badge>
                        ) : supervisor.reviewRate >= 40 ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Defenses Tab */}
        <TabsContent value="defenses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Department Defenses</CardTitle>
                  <CardDescription>
                    View and manage student defenses in your department
                  </CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Panel Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.recentActivities.upcomingDefenses.map((defense) => (
                    <TableRow key={defense.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{defense.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {defense.studentMatric}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(defense.defenseDate)}</p>
                          <p className="text-sm text-muted-foreground">
                            {defense.defenseTime}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{defense.venue}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          3 Members
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-blue-800">
                          SCHEDULED
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">-</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Department Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive department overview
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-chart-1/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Performance Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Supervisor and student performance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-chart-2/20 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Defense Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Defense scheduling and results
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
              <CardDescription>
                Create a custom report with specific parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Report Type</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student_progress">Student Progress</SelectItem>
                        <SelectItem value="supervisor_performance">Supervisor Performance</SelectItem>
                        <SelectItem value="logbook_submissions">Logbook Submissions</SelectItem>
                        <SelectItem value="defense_results">Defense Results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last_week">Last Week</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="last_quarter">Last Quarter</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline">Preview Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HODDashboard;
