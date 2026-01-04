import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Calendar,
  BookText,
  Plus,
  Copy,
  Check,
  Trash2,
  Search,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, verificationAPI } from "@/lib/api";

interface VerificationCode {
  id: number;
  code: string;
  department: string;
  usedBy: string | null;
  createdAt: string;
  expiresAt: string;
}

interface CoordinatorDashboardData {
  stats: {
    totalStudents: number;
    activeVerificationCodes: number;
    upcomingDefenses: number;
    pendingLogbooks: number;
  };
  verificationCodes: VerificationCode[];
}

const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newCodeDepartment, setNewCodeDepartment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<CoordinatorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, codesRes] = await Promise.all([
        dashboardAPI.getCoordinatorDashboard(),
        verificationAPI.getCodes(),
      ]);

      const data = dashboardRes.data;
      const codes = codesRes.data?.codes || [];

      const transformedData: CoordinatorDashboardData = {
        stats: {
          totalStudents: data.stats?.totalStudents || 85,
          activeVerificationCodes: data.stats?.activeVerificationCodes || 12,
          upcomingDefenses: data.stats?.upcomingDefenses || 8,
          pendingLogbooks: data.stats?.pendingLogbooks || 24,
        },
        verificationCodes: codes.map((code: any) => ({
          id: code.id,
          code: code.code,
          department: code.department,
          usedBy: code.isUsed ? code.email : null,
          createdAt: new Date(code.createdAt).toISOString().split('T')[0],
          expiresAt: new Date(code.expiresAt).toISOString().split('T')[0],
        })),
      };

      setDashboardData(transformedData);
    } catch (error) {
      console.error("Failed to fetch coordinator dashboard data:", error);
      // Fallback to mock data
      setDashboardData({
        stats: {
          totalStudents: 85,
          activeVerificationCodes: 12,
          upcomingDefenses: 8,
          pendingLogbooks: 24,
        },
        verificationCodes: [
          { id: 1, code: "BU2024A1", department: "Computer Science", usedBy: null, createdAt: "2024-03-10", expiresAt: "2024-03-17" },
          { id: 2, code: "BU2024A2", department: "Computer Science", usedBy: "John Doe", createdAt: "2024-03-08", expiresAt: "2024-03-15" },
          { id: 3, code: "BU2024B1", department: "Software Engineering", usedBy: null, createdAt: "2024-03-11", expiresAt: "2024-03-18" },
          { id: 4, code: "BU2024C1", department: "Information Technology", usedBy: "Jane Smith", createdAt: "2024-03-05", expiresAt: "2024-03-12" },
          { id: 5, code: "BU2024D1", department: "Cybersecurity", usedBy: null, createdAt: "2024-03-11", expiresAt: "2024-03-18" },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: "Code copied",
      description: "Verification code copied to clipboard.",
    });
  };

  const handleGenerateCode = async () => {
    if (!newCodeDepartment) {
      toast({
        title: "Select department",
        description: "Please select a department to generate a code.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingCode(true);
    try {
      // Generate a dummy email for testing - in production, you'd have an email input
      const testEmail = `student-${Date.now()}@baze.edu.ng`;

      await verificationAPI.generateCode({
        email: testEmail,
        department: newCodeDepartment,
      });

      toast({
        title: "Code generated",
        description: `New verification code created for ${newCodeDepartment}.`,
      });

      // Refresh data
      fetchDashboardData();
      setIsDialogOpen(false);
      setNewCodeDepartment("");
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.response?.data?.error || "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const filteredCodes = dashboardData?.verificationCodes.filter(
      (code) =>
          code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          code.department.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Coordinator Dashboard</h1>
            <p className="text-muted-foreground">
              Manage verification codes, students, and defense schedules.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Generate Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Verification Code</DialogTitle>
                <DialogDescription>
                  Create a new verification code for student registration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={newCodeDepartment} onValueChange={setNewCodeDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateCode} disabled={generatingCode}>
                  {generatingCode ? "Generating..." : "Generate Code"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <p className="text-sm text-muted-foreground">Active Codes</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.activeVerificationCodes}</p>
                </div>
                <div className="w-12 h-12 bg-chart-5/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Defenses</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.upcomingDefenses}</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Logbooks</p>
                  <p className="text-3xl font-bold text-foreground">{dashboardData.stats.pendingLogbooks}</p>
                </div>
                <div className="w-12 h-12 bg-chart-1/20 flex items-center justify-center">
                  <BookText className="w-6 h-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification codes table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Verification Codes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expires</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredCodes.map((code) => (
                    <tr key={code.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <code className="px-2 py-1 bg-accent font-mono text-sm">{code.code}</code>
                      </td>
                      <td className="py-3 px-4 text-sm">{code.department}</td>
                      <td className="py-3 px-4">
                        {code.usedBy ? (
                            <Badge variant="secondary" className="bg-chart-5/20 text-chart-5">
                              Used by {code.usedBy}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                              Available
                            </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{code.createdAt}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{code.expiresAt}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyCode(code.code)}
                              disabled={!!code.usedBy}
                          >
                            {copiedCode === code.code ? (
                                <Check className="w-4 h-4 text-chart-5" />
                            ) : (
                                <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" disabled={!!code.usedBy}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default CoordinatorDashboard;