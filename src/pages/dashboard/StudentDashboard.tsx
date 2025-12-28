import { Link } from "react-router-dom";
import {
  BookText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const mockData = {
  student: {
    name: "John Doe",
    matricNumber: "BU/23A/IT/8002",
    department: "Information Technology",
    company: "Tech Solutions Ltd",
    supervisor: "Dr. Sarah Johnson",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
  },
  progress: {
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

const StudentDashboard = () => {
  const progressPercentage = (mockData.progress.weeksCompleted / mockData.progress.totalWeeks) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {mockData.student.name.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Track your SIWES progress and manage your logbook submissions.
          </p>
        </div>
        <Button asChild>
          <Link to="/logbook/new">
            <BookText className="w-4 h-4 mr-2" />
            Submit Logbook Entry
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weeks Completed</p>
                <p className="text-3xl font-bold text-foreground">
                  {mockData.progress.weeksCompleted}
                  <span className="text-lg text-muted-foreground">/{mockData.progress.totalWeeks}</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Logbooks Submitted</p>
                <p className="text-3xl font-bold text-foreground">{mockData.progress.logbooksSubmitted}</p>
              </div>
              <div className="w-12 h-12 bg-chart-2/20 flex items-center justify-center">
                <BookText className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Entries</p>
                <p className="text-3xl font-bold text-foreground">{mockData.progress.logbooksApproved}</p>
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
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold text-foreground">{mockData.progress.logbooksPending}</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SIWES Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Completion</span>
              <span className="font-medium text-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center p-4 bg-accent">
                <p className="text-2xl font-bold text-foreground">{mockData.student.matricNumber}</p>
                <p className="text-xs text-muted-foreground">Matric Number</p>
              </div>
              <div className="text-center p-4 bg-accent">
                <p className="text-lg font-semibold text-foreground">{mockData.student.department}</p>
                <p className="text-xs text-muted-foreground">Department</p>
              </div>
              <div className="text-center p-4 bg-accent">
                <p className="text-lg font-semibold text-foreground">{mockData.student.company}</p>
                <p className="text-xs text-muted-foreground">Organization</p>
              </div>
              <div className="text-center p-4 bg-accent">
                <p className="text-lg font-semibold text-foreground">{mockData.student.supervisor}</p>
                <p className="text-xs text-muted-foreground">Supervisor</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent logbook entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Logbook Entries</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/logbook">
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivities.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card flex items-center justify-center">
                      <BookText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Week {entry.week} Entry</p>
                      <p className="text-sm text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>
                  <Badge
                    variant={entry.status === "approved" ? "default" : "secondary"}
                    className={entry.status === "approved" ? "bg-chart-5" : ""}
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Defense</CardTitle>
          </CardHeader>
          <CardContent>
            {mockData.upcomingDefense ? (
              <div className="space-y-4">
                <div className="p-6 bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">SIWES Defense Presentation</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {mockData.upcomingDefense.date}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {mockData.upcomingDefense.time}
                        </p>
                        <p className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {mockData.upcomingDefense.venue}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/defense">
                    View Defense Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No defense scheduled yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
