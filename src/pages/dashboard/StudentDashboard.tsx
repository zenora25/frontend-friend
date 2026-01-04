import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Target,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, studentAPI } from "@/lib/api";

interface DashboardData {
  student: {
    name: string;
    matricNumber: string;
    department: string;
    company: string;
    supervisor: string;
    startDate: string;
    endDate: string;
  };
  stats: {
    weeksCompleted: number;
    totalWeeks: number;
    logbooksSubmitted: number;
    logbooksPending: number;
    logbooksApproved: number;
  };
  recentActivities: Array<{
    id: number;
    week: number;
    status: string;
    date: string;
  }>;
  upcomingDefense: {
    date: string;
    time: string;
    venue: string;
  } | null;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getStudentDashboard();
      const data = response.data;

      // Transform API data to match component structure
      const transformedData: DashboardData = {
        student: {
          name: data.student?.fullName || user?.fullName || "",
          matricNumber: data.student?.matricNumber || user?.matricNumber || "",
          department: data.student?.department || user?.department || "",
          company: data.student?.companyName || user?.companyName || "",
          supervisor: "Dr. Sarah Johnson", // This would come from API
          startDate: "2024-01-15",
          endDate: "2024-06-15",
        },
        stats: {
          weeksCompleted: data.stats?.weeksCompleted || 0,
          totalWeeks: data.stats?.totalWeeks || 24,
          logbooksSubmitted: data.stats?.logbooksSubmitted || 0,
          logbooksPending: data.stats?.logbooksPending || 0,
          logbooksApproved: data.stats?.logbooksApproved || 0,
        },
        recentActivities: data.recentActivities?.map((activity: any) => ({
          id: activity.id,
          week: activity.week,
          status: activity.status,
          date: activity.date,
        })) || [],
        upcomingDefense: data.upcomingDefense ? {
          date: data.upcomingDefense.date,
          time: data.upcomingDefense.time,
          venue: data.upcomingDefense.venue,
        } : null,
      };

      setDashboardData(transformedData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Fallback to mock data for demo
      setDashboardData(getMockData());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data fallback
  const getMockData = (): DashboardData => {
    return {
      student: {
        name: user?.fullName || "John Doe",
        matricNumber: user?.matricNumber || "BU/23A/IT/8002",
        department: user?.department || "Information Technology",
        company: user?.companyName || "Tech Solutions Ltd",
        supervisor: "Dr. Sarah Johnson",
        startDate: "2024-01-15",
        endDate: "2024-06-15",
      },
      stats: {
        weeksCompleted: 8,
        totalWeeks: 24,
        logbooksSubmitted: 7,
        logbooksPending: 1,
        logbooksApproved: 6,
      },
      recentActivities: [
        { id: 1, week: 8, status: "pending", date: "2024-03-11" },
        { id: 2, week: 7, status: "approved", date: "2024-03-04" },
        { id: 3, week: 6, status: "approved", date: "2024-02-26" },
        { id: 4, week: 5, status: "approved", date: "2024-02-19" },
      ],
      upcomingDefense: {
        date: "2024-06-20",
        time: "10:00 AM",
        venue: "Room 204, Faculty of Computing",
      },
    };
  };

  if (isLoading || !dashboardData) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
    );
  }

  const progressPercentage = (dashboardData.stats.weeksCompleted / dashboardData.stats.totalWeeks) * 100;

  const statCards = [
    {
      title: "Weeks Completed",
      value: dashboardData.stats.weeksCompleted,
      subtitle: `of ${dashboardData.stats.totalWeeks}`,
      icon: TrendingUp,
      gradient: "from-primary to-secondary",
      bgGradient: "from-primary/10 to-secondary/10",
    },
    {
      title: "Logbooks Submitted",
      value: dashboardData.stats.logbooksSubmitted,
      icon: BookText,
      gradient: "from-chart-2 to-chart-3",
      bgGradient: "from-chart-2/10 to-chart-3/10",
    },
    {
      title: "Approved Entries",
      value: dashboardData.stats.logbooksApproved,
      icon: CheckCircle2,
      gradient: "from-chart-5 to-chart-4",
      bgGradient: "from-chart-5/10 to-chart-4/10",
    },
    {
      title: "Pending Review",
      value: dashboardData.stats.logbooksPending,
      icon: Clock,
      gradient: "from-destructive to-destructive",
      bgGradient: "from-destructive/10 to-destructive/5",
    },
  ];

  return (
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="relative overflow-hidden p-6 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 bg-gradient-to-r from-primary via-secondary to-primary">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  Welcome back, {dashboardData.student.name.split(" ")[0]}!
                </h1>
                <p className="text-primary-foreground/70">
                  Track your SIWES progress and manage your logbook submissions.
                </p>
              </div>
            </div>
            <Button asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg">
              <Link to="/logbook/new">
                <BookText className="w-4 h-4 mr-2" />
                Submit Logbook Entry
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
              <Card
                  key={index}
                  className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">{stat.value}</span>
                        {stat.subtitle && (
                            <span className="text-lg text-muted-foreground">{stat.subtitle}</span>
                        )}
                      </div>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        {/* Progress section */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-5" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl">SIWES Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Overall Completion</span>
                  <span className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="relative h-4 bg-muted/30 overflow-hidden">
                  <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-chart-2 to-chart-5 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Matric Number", value: dashboardData.student.matricNumber },
                  { label: "Department", value: dashboardData.student.department },
                  { label: "Organization", value: dashboardData.student.company },
                  { label: "Supervisor", value: dashboardData.student.supervisor },
                ].map((item, index) => (
                    <div
                        key={index}
                        className="p-4 bg-gradient-to-br from-accent/50 to-accent/20 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                      <p className="font-semibold text-foreground text-sm truncate">{item.value}</p>
                    </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent logbook entries */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="h-1 bg-gradient-to-r from-primary to-chart-2" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-2/10 flex items-center justify-center">
                  <BookText className="w-5 h-5 text-chart-2" />
                </div>
                <CardTitle className="text-lg">Recent Logbook Entries</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
                <Link to="/logbook">
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentActivities.map((entry, index) => (
                    <div
                        key={entry.id}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-card to-accent/20 border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center font-semibold text-primary">
                          W{entry.week}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Week {entry.week} Entry</p>
                          <p className="text-sm text-muted-foreground">{entry.date}</p>
                        </div>
                      </div>
                      <Badge
                          className={`${
                              entry.status === "approved"
                                  ? "bg-chart-5/20 text-chart-5 border-chart-5/30"
                                  : "bg-muted/30 text-muted-foreground border-muted/50"
                          }`}
                      >
                        {entry.status === "approved" ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                            <Clock className="w-3 h-3 mr-1" />
                        )}
                        {entry.status}
                      </Badge>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming defense */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="h-1 bg-gradient-to-r from-chart-5 to-chart-4" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-5/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-chart-5" />
                </div>
                <CardTitle className="text-lg">Upcoming Defense</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData.upcomingDefense ? (
                  <div className="space-y-4">
                    <div className="relative p-6 bg-gradient-to-br from-chart-5/10 to-chart-5/5 border border-chart-5/20 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-chart-5/10 rounded-full blur-2xl" />
                      <div className="relative flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-chart-5 to-chart-4 flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Calendar className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground text-lg">SIWES Defense Presentation</h3>
                          <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-3 text-muted-foreground">
                              <Calendar className="w-4 h-4 text-chart-5" />
                              <span className="font-medium text-foreground">{dashboardData.upcomingDefense.date}</span>
                            </p>
                            <p className="flex items-center gap-3 text-muted-foreground">
                              <Clock className="w-4 h-4 text-chart-5" />
                              <span className="font-medium text-foreground">{dashboardData.upcomingDefense.time}</span>
                            </p>
                            <p className="flex items-center gap-3 text-muted-foreground">
                              <AlertCircle className="w-4 h-4 text-chart-5" />
                              <span className="font-medium text-foreground">{dashboardData.upcomingDefense.venue}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full h-12 bg-gradient-to-r from-chart-5 to-chart-4 hover:opacity-90" asChild>
                      <Link to="/defense">
                        View Defense Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
              ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No defense scheduled yet</p>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default StudentDashboard;