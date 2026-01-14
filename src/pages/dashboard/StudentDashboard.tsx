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
          supervisor: data.student?.supervisorName || "Not Assigned",
          startDate: data.student?.siwesStartDate || "",
          endDate: data.student?.siwesEndDate || "",
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
          status: activity.status.toLowerCase(),
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
      // No fallback to mock data
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
      gradient: "from-gray-700 to-gray-600",
      bgGradient: "from-gray-100 to-gray-50",
    },
    {
      title: "Logbooks Submitted",
      value: dashboardData.stats.logbooksSubmitted,
      icon: BookText,
      gradient: "from-gray-700 to-gray-600",
      bgGradient: "from-gray-100 to-gray-50",
    },
    {
      title: "Approved Entries",
      value: dashboardData.stats.logbooksApproved,
      icon: CheckCircle2,
      gradient: "from-gray-700 to-gray-600",
      bgGradient: "from-gray-100 to-gray-50",
    },
    {
      title: "Pending Review",
      value: dashboardData.stats.logbooksPending,
      icon: Clock,
      gradient: "from-gray-700 to-gray-600",
      bgGradient: "from-gray-100 to-gray-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="relative overflow-hidden p-6 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {dashboardData.student.name.split(" ")[0]}!
              </h1>
              <p className="text-white/70">
                Track your SIWES progress and manage your logbook submissions.
              </p>
            </div>
          </div>
          <Button asChild className="bg-white text-gray-800 hover:bg-white/90 shadow">
            <Link to="/dashboard/logbook/submit">
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
            className="group overflow-hidden border border-gray-200 shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            <CardContent className="p-6 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{stat.value}</span>
                    {stat.subtitle && (
                      <span className="text-lg text-gray-600">{stat.subtitle}</span>
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-200`}>
                  <stat.icon className={`w-6 h-6 text-gray-700`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress section */}
      <Card className="overflow-hidden border border-gray-200 shadow">
        <div className="h-1 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500" />
        <CardHeader className="bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
              <Target className="w-5 h-5 text-gray-700" />
            </div>
            <CardTitle className="text-xl text-gray-900">SIWES Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-600">Overall Completion</span>
                <span className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="relative h-4 bg-gray-100 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 transition-all duration-500"
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
                  className="p-4 bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent logbook entries */}
        <Card className="overflow-hidden border border-gray-200 shadow">
          <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600" />
          <CardHeader className="bg-gray-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
                <BookText className="w-5 h-5 text-gray-700" />
              </div>
              <CardTitle className="text-lg text-gray-900">Recent Logbook Entries</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Link to="/dashboard/logbook">
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="space-y-3">
              {dashboardData.recentActivities.map((entry, index) => (
                <div
                  key={entry.id}
                  className="group flex items-center justify-between p-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center font-semibold text-gray-900">
                      W{entry.week}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Week {entry.week} Entry</p>
                      <p className="text-sm text-gray-600">{entry.date}</p>
                    </div>
                  </div>
                  <Badge
                    className={`${entry.status === "approved"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                  >
                    {entry.status === "approved" ? (
                      <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1 text-gray-600" />
                    )}
                    {entry.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming defense */}
        <Card className="overflow-hidden border border-gray-200 shadow">
          <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600" />
          <CardHeader className="bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Award className="w-5 h-5 text-gray-700" />
              </div>
              <CardTitle className="text-lg text-gray-900">Upcoming Defense</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="bg-white">
            {dashboardData.upcomingDefense ? (
              <div className="space-y-4">
                <div className="relative p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full blur-2xl" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center flex-shrink-0 shadow">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-lg">SIWES Defense Presentation</h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-3 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-700" />
                          <span className="font-medium text-gray-900">{dashboardData.upcomingDefense.date}</span>
                        </p>
                        <p className="flex items-center gap-3 text-gray-600">
                          <Clock className="w-4 h-4 text-gray-700" />
                          <span className="font-medium text-gray-900">{dashboardData.upcomingDefense.time}</span>
                        </p>
                        <p className="flex items-center gap-3 text-gray-600">
                          <AlertCircle className="w-4 h-4 text-gray-700" />
                          <span className="font-medium text-gray-900">{dashboardData.upcomingDefense.venue}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full h-12 bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90" asChild>
                  <Link to="/dashboard/defense">
                    View Defense Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-700">No defense scheduled yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;