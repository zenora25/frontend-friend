import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookText,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  Search,
  Calendar,
  ChevronRight,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logbookAPI } from "@/lib/api";

interface LogbookEntry {
  id: number;
  week: number;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "revision";
  title: string;
  summary: string;
  supervisorComment: string | null;
  submittedAt: string;
}

const WeeklyLogbook = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogbooks();
  }, []);

  const fetchLogbooks = async () => {
    try {
      const response = await logbookAPI.getMyLogbook();
      const data = response.data || [];

      const transformedLogbooks: LogbookEntry[] = data.map((logbook: any) => ({
        id: logbook.id,
        week: logbook.weekNumber,
        startDate: logbook.startDate,
        endDate: logbook.endDate,
        status: logbook.status.toLowerCase() as "pending" | "approved" | "revision",
        title: logbook.title,
        summary: logbook.weekSummary,
        supervisorComment: logbook.supervisorComment || logbook.industrySupervisorComment,
        submittedAt: new Date(logbook.createdAt).toLocaleDateString(),
      }));

      setLogbooks(transformedLogbooks.length > 0 ? transformedLogbooks : getMockLogbooks());
    } catch (error) {
      console.error("Failed to fetch logbooks:", error);
      setLogbooks(getMockLogbooks());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockLogbooks = (): LogbookEntry[] => {
    return [
      {
        id: 1,
        week: 8,
        startDate: "2024-03-11",
        endDate: "2024-03-17",
        status: "pending",
        title: "API Development & Testing",
        summary: "Worked on implementing REST API endpoints for user management module. Conducted unit tests and fixed bugs identified during code review.",
        supervisorComment: null,
        submittedAt: "2024-03-17 09:30 AM",
      },
      {
        id: 2,
        week: 7,
        startDate: "2024-03-04",
        endDate: "2024-03-10",
        status: "approved",
        title: "Database Design & Implementation",
        summary: "Designed and implemented database schema for the inventory module. Created stored procedures and optimized queries for better performance.",
        supervisorComment: "Excellent work on the database design. The normalization approach was well thought out.",
        submittedAt: "2024-03-10 11:45 AM",
      },
      {
        id: 3,
        week: 6,
        startDate: "2024-02-26",
        endDate: "2024-03-03",
        status: "approved",
        title: "Frontend UI Development",
        summary: "Built responsive UI components using React and Tailwind CSS. Implemented form validation and error handling for user input fields.",
        supervisorComment: "Good progress on the UI. Consider adding more accessibility features.",
        submittedAt: "2024-03-03 02:15 PM",
      },
      {
        id: 4,
        week: 5,
        startDate: "2024-02-19",
        endDate: "2024-02-25",
        status: "approved",
        title: "Project Setup & Planning",
        summary: "Set up development environment and configured project dependencies. Participated in sprint planning and task estimation.",
        supervisorComment: "Great initiative in setting up the project structure.",
        submittedAt: "2024-02-25 04:00 PM",
      },
      {
        id: 5,
        week: 4,
        startDate: "2024-02-12",
        endDate: "2024-02-18",
        status: "revision",
        title: "Code Review & Refactoring",
        summary: "Reviewed existing codebase and identified areas for improvement. Started refactoring legacy code to follow best practices.",
        supervisorComment: "Please provide more details about the specific refactoring changes made.",
        submittedAt: "2024-02-18 10:30 AM",
      },
    ];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-gray-600" />;
      case "revision":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "revision":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredLogbooks = logbooks.filter((logbook) => {
    const matchesSearch =
        logbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        logbook.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || logbook.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalEntries: logbooks.length,
    approved: logbooks.filter((l) => l.status === "approved").length,
    pending: logbooks.filter((l) => l.status === "pending").length,
    revision: logbooks.filter((l) => l.status === "revision").length,
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-700" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Logbook</h1>
            <p className="text-gray-600">
              Track and manage your weekly SIWES logbook entries.
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90">
            <Link to="/dashboard/logbook/submit">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Link>
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <BookText className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
                  <p className="text-xs text-gray-600">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 border border-green-200 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  <p className="text-xs text-gray-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 border border-red-200 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.revision}</p>
                  <p className="text-xs text-gray-600">Needs Revision</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300 focus:border-gray-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-gray-400">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entries</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="revision">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logbook entries */}
        <div className="space-y-4">
          {filteredLogbooks.map((logbook) => (
              <Card key={logbook.id} className="border border-gray-200 hover:shadow transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Week indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-white">
                        <span className="text-xs uppercase">Week</span>
                        <span className="text-2xl font-bold">{logbook.week}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{logbook.title}</h3>
                        <Badge variant="secondary" className={getStatusColor(logbook.status)}>
                          {getStatusIcon(logbook.status)}
                          <span className="ml-1 capitalize">{logbook.status}</span>
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">{logbook.summary}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {logbook.startDate} - {logbook.endDate}
                    </span>
                        <span>Submitted: {logbook.submittedAt}</span>
                      </div>

                      {logbook.supervisorComment && (
                          <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200">
                            <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium text-gray-900">Supervisor Comment</p>
                              <p className="text-sm text-gray-600">{logbook.supervisorComment}</p>
                            </div>
                          </div>
                      )}
                    </div>

                    {/* Action */}
                    <Button variant="ghost" size="icon" className="flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100" asChild>
                      <Link to={`/dashboard/logbook/${logbook.id}`}>
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>

        {filteredLogbooks.length === 0 && (
            <div className="text-center py-12">
              <BookText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">No entries found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
        )}
      </div>
  );
};

export default WeeklyLogbook;