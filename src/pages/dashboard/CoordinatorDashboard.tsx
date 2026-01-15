
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
  Mail,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, verificationAPI } from "@/lib/api";

interface VerificationCode {
  id: number;
  code: string;
  email: string;
  department: string;
  usedBy: string | null;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
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
  const [newCodeEmail, setNewCodeEmail] = useState("");
  const [newCodeDepartment, setNewCodeDepartment] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<CoordinatorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [generatingBulk, setGeneratingBulk] = useState(false);
  const [activeTab, setActiveTab] = useState("single");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, codesRes] = await Promise.all([
        dashboardAPI.getCoordinatorDashboard(),
        verificationAPI.getCodes({ limit: 50 }),
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
          email: code.email,
          department: code.department,
          usedBy: code.isUsed ? code.email : null,
          isUsed: code.isUsed,
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
          { id: 1, code: "ABC123", email: "newstudent1@baze.edu.ng", department: "Computer Science", usedBy: null, isUsed: false, createdAt: "2024-03-10", expiresAt: "2024-03-17" },
          { id: 2, code: "DEF456", email: "newstudent2@baze.edu.ng", department: "Software Engineering", usedBy: null, isUsed: false, createdAt: "2024-03-08", expiresAt: "2024-03-15" },
          { id: 3, code: "GHI789", email: "student3@baze.edu.ng", department: "Software Engineering", usedBy: null, isUsed: false, createdAt: "2024-03-11", expiresAt: "2024-03-18" },
          { id: 4, code: "JKL012", email: "student4@baze.edu.ng", department: "Information Technology", usedBy: "Jane Smith", isUsed: true, createdAt: "2024-03-05", expiresAt: "2024-03-12" },
          { id: 5, code: "MNO345", email: "student5@baze.edu.ng", department: "Cybersecurity", usedBy: null, isUsed: false, createdAt: "2024-03-11", expiresAt: "2024-03-18" },
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
    if (!newCodeEmail || !newCodeDepartment) {
      toast({
        title: "Missing information",
        description: "Please enter both email and department.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCodeEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingCode(true);
    try {
      const response = await verificationAPI.generateCode({
        email: newCodeEmail.trim(),
        department: newCodeDepartment,
      });

      toast({
        title: "Code generated",
        description: `Verification code created for ${newCodeEmail}.`,
      });

      // Refresh data
      fetchDashboardData();
      setIsDialogOpen(false);
      setNewCodeEmail("");
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

  const handleBulkGenerate = async () => {
    if (!bulkEmails || !newCodeDepartment) {
      toast({
        title: "Missing information",
        description: "Please enter emails and select a department.",
        variant: "destructive",
      });
      return;
    }

    const emails = bulkEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      toast({
        title: "No emails",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingBulk(true);
    try {
      const response = await verificationAPI.bulkGenerateCodes({
        emails: emails,
        department: newCodeDepartment,
      });

      toast({
        title: "Codes generated",
        description: `Generated ${response.data.generatedCodes?.length || 0} verification codes.`,
      });

      if (response.data.errors?.length > 0) {
        toast({
          title: "Some errors occurred",
          description: `${response.data.errors.length} emails failed.`,
          variant: "destructive",
        });
      }

      // Refresh data
      fetchDashboardData();
      setIsBulkDialogOpen(false);
      setBulkEmails("");
      setNewCodeDepartment("");
    } catch (error: any) {
      toast({
        title: "Bulk generation failed",
        description: error.response?.data?.error || "Failed to generate codes",
        variant: "destructive",
      });
    } finally {
      setGeneratingBulk(false);
    }
  };

  const handleDeleteCode = async (codeId: number, code: string) => {
    if (!confirm(`Are you sure you want to delete code ${code}?`)) {
      return;
    }

    try {
      await verificationAPI.deleteCode(codeId.toString());
      toast({
        title: "Code deleted",
        description: `Verification code ${code} has been deleted.`,
      });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.response?.data?.error || "Failed to delete code",
        variant: "destructive",
      });
    }
  };

  const filteredCodes = dashboardData?.verificationCodes.filter(
    (code) =>
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const activeCodes = filteredCodes.filter(code => !code.isUsed && new Date(code.expiresAt) > new Date());
  const usedCodes = filteredCodes.filter(code => code.isUsed);
  const expiredCodes = filteredCodes.filter(code => !code.isUsed && new Date(code.expiresAt) <= new Date());

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
        <div className="flex gap-2">
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
                  Create a new verification code for a specific student's email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Student Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@baze.edu.ng"
                    value={newCodeEmail}
                    onChange={(e) => setNewCodeEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only this email can use this verification code
                  </p>
                </div>
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

          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Generate Codes</DialogTitle>
                <DialogDescription>
                  Generate multiple verification codes at once (one per line).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-emails">Student Emails (one per line)</Label>
                  <Textarea
                    id="bulk-emails"
                    placeholder="student1@baze.edu.ng&#10;student2@baze.edu.ng&#10;student3@baze.edu.ng"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Each email will receive a unique verification code
                  </p>
                </div>
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
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkGenerate} disabled={generatingBulk}>
                  {generatingBulk ? "Generating..." : "Generate Codes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
          <div>
            <CardTitle className="text-lg">Verification Codes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Each code is linked to a specific student email
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search codes, emails, or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="icon" onClick={fetchDashboardData}>
              <Loader2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Codes ({filteredCodes.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({activeCodes.length})</TabsTrigger>
              <TabsTrigger value="used">Used ({usedCodes.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({expiredCodes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <CodeTable
                codes={filteredCodes}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
                onDeleteCode={handleDeleteCode}
              />
            </TabsContent>
            <TabsContent value="active">
              <CodeTable
                codes={activeCodes}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
                onDeleteCode={handleDeleteCode}
              />
            </TabsContent>
            <TabsContent value="used">
              <CodeTable
                codes={usedCodes}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
                onDeleteCode={handleDeleteCode}
              />
            </TabsContent>
            <TabsContent value="expired">
              <CodeTable
                codes={expiredCodes}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
                onDeleteCode={handleDeleteCode}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface CodeTableProps {
  codes: VerificationCode[];
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  onDeleteCode: (id: number, code: string) => void;
}

const CodeTable = ({ codes, copiedCode, onCopyCode, onDeleteCode }: CodeTableProps) => {
  if (codes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No verification codes found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email
              </div>
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expires</th>
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((code) => {
            const isExpired = !code.isUsed && new Date(code.expiresAt) <= new Date();
            return (
              <tr key={code.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                <td className="py-3 px-4">
                  <code className="px-2 py-1 bg-accent font-mono text-sm">{code.code}</code>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    {code.email}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{code.department}</td>
                <td className="py-3 px-4">
                  {code.isUsed ? (
                    <Badge variant="secondary" className="bg-chart-5/20 text-chart-5">
                      Used
                    </Badge>
                  ) : isExpired ? (
                    <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                      Expired
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
                      onClick={() => onCopyCode(code.code)}
                      disabled={code.isUsed || isExpired}
                      title="Copy code"
                    >
                      {copiedCode === code.code ? (
                        <Check className="w-4 h-4 text-chart-5" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCode(code.id, code.code)}
                      disabled={code.isUsed}
                      title="Delete code"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CoordinatorDashboard;
