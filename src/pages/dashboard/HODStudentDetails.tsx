import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Building,
    Mail,
    Phone,
    MapPin,
    BookOpen,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    Download,
    Printer,
    Edit,
    User,
    GraduationCap,
    Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { studentAPI, logbookAPI, defenseAPI, hodAPI } from "@/lib/api";

interface StudentDetails {
    id: string;
    fullName: string;
    email: string;
    matricNumber: string;
    department: string;
    companyName: string;
    companyAddress: string;
    phone: string;
    progress: number;
    status: string;
    assignedSupervisor?: {
        id: string;
        fullName: string;
        email: string;
    };
    assignedIndustrySupervisor?: {
        id: string;
        fullName: string;
        companyName: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface LogbookEntry {
    id: string;
    weekNumber: number;
    title: string;
    startDate: string;
    endDate: string;
    status: string;
    weekSummary: string;
    supervisorComment?: string;
    createdAt: string;
    updatedAt: string;
}

interface DefenseInfo {
    id: string;
    defenseDate: string;
    defenseTime: string;
    venue: string;
    status: string;
    score?: number;
    remarks?: string;
    panelMembers: string[];
    scheduledBy: string;
}

const HODStudentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [student, setStudent] = useState<StudentDetails | null>(null);
    const [logbooks, setLogbooks] = useState<LogbookEntry[]>([]);
    const [defense, setDefense] = useState<DefenseInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
    const [availableSupervisors, setAvailableSupervisors] = useState<any[]>([]);
    const [progressUpdate, setProgressUpdate] = useState(0);

    useEffect(() => {
        if (id) {
            fetchStudentDetails();
            fetchStudentLogbooks();
            fetchStudentDefense();
            fetchAvailableSupervisors();
        }
    }, [id]);

    const fetchStudentDetails = async () => {
        try {
            const response = await studentAPI.getById(id!);
            setStudent(response.data);
        } catch (error: any) {
            console.error("Failed to fetch student details:", error);
            toast({
                title: "Error",
                description: "Failed to load student details",
                variant: "destructive",
            });
        }
    };

    const fetchStudentLogbooks = async () => {
        try {
            const response = await logbookAPI.getStudentLogbook(id!);
            setLogbooks(response.data || []);
        } catch (error: any) {
            console.error("Failed to fetch student logbooks:", error);
        }
    };

    const fetchStudentDefense = async () => {
        try {
            const response = await defenseAPI.getStudentDefense(id!);
            setDefense(response.data);
        } catch (error: any) {
            console.error("Failed to fetch student defense:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvailableSupervisors = async () => {
        try {
            const response = await hodAPI.getDepartmentSupervisors();
            setAvailableSupervisors(response.data || []);
        } catch (error: any) {
            console.error("Failed to fetch supervisors:", error);
        }
    };

    const handleAssignSupervisor = async () => {
        if (!selectedSupervisorId) {
            toast({
                title: "Error",
                description: "Please select a supervisor",
                variant: "destructive",
            });
            return;
        }

        try {
            await hodAPI.assignStudentToSupervisor({
                studentId: id!,
                institutionSupervisorId: selectedSupervisorId,
            });

            toast({
                title: "Success",
                description: "Supervisor assigned successfully",
            });

            setIsAssignDialogOpen(false);
            fetchStudentDetails();
        } catch (error: any) {
            console.error("Failed to assign supervisor:", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to assign supervisor",
                variant: "destructive",
            });
        }
    };

    const handleUpdateProgress = async () => {
        try {
            await studentAPI.updateProgress(id!, progressUpdate);

            toast({
                title: "Success",
                description: "Student progress updated successfully",
            });

            fetchStudentDetails();
        } catch (error: any) {
            console.error("Failed to update progress:", error);
            toast({
                title: "Error",
                description: "Failed to update progress",
                variant: "destructive",
            });
        }
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading student details...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    The student you're looking for doesn't exist or you don't have access.
                </p>
                <Button onClick={() => navigate("/hod/dashboard")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/hod/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{student.fullName}</h1>
                        <p className="text-muted-foreground">
                            {student.matricNumber} • {student.department}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Report
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Student Profile</DialogTitle>
                                <DialogDescription>
                                    Update student information and progress.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="progress">Progress (%)</Label>
                                    <Input
                                        id="progress"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={progressUpdate || student.progress}
                                        onChange={(e) => setProgressUpdate(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        className="w-full p-2 border rounded"
                                        defaultValue={student.status}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button onClick={handleUpdateProgress}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Student Info Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{student.fullName}</h3>
                                <p className="text-sm text-muted-foreground">{student.matricNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{student.email}</span>
                            </div>
                            {student.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{student.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{student.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{student.companyName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{student.companyAddress}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="font-bold">{student.progress}%</span>
                            </div>
                            <Progress value={student.progress} className="h-2" />
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <Badge className={getStatusColor(student.status)}>
                                    {student.status}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-medium">Joined</span>
                                <span className="text-sm text-muted-foreground">
                  {formatDate(student.createdAt)}
                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="logbooks">Logbooks ({logbooks.length})</TabsTrigger>
                            <TabsTrigger value="defense">Defense</TabsTrigger>
                            <TabsTrigger value="supervisors">Supervisors</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Supervisor Assignment</CardTitle>
                                    <CardDescription>
                                        Manage institution and industry supervisors for this student
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Institution Supervisor */}
                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-primary" />
                                                    <h4 className="font-semibold">Institution Supervisor</h4>
                                                </div>
                                                <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            {student.assignedSupervisor ? "Change" : "Assign"}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Assign Institution Supervisor</DialogTitle>
                                                            <DialogDescription>
                                                                Select a supervisor from your department
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="supervisor">Select Supervisor</Label>
                                                                <select
                                                                    id="supervisor"
                                                                    className="w-full p-2 border rounded"
                                                                    value={selectedSupervisorId}
                                                                    onChange={(e) => setSelectedSupervisorId(e.target.value)}
                                                                >
                                                                    <option value="">Choose a supervisor</option>
                                                                    {availableSupervisors.map((sup) => (
                                                                        <option key={sup.id} value={sup.id}>
                                                                            {sup.fullName} ({sup.email})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                                                                Cancel
                                                            </Button>
                                                            <Button onClick={handleAssignSupervisor}>
                                                                Assign Supervisor
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            {student.assignedSupervisor ? (
                                                <div className="space-y-2">
                                                    <p className="font-medium">{student.assignedSupervisor.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.assignedSupervisor.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground italic">
                                                    No institution supervisor assigned
                                                </p>
                                            )}
                                        </div>

                                        {/* Industry Supervisor */}
                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="h-4 w-4 text-chart-1" />
                                                    <h4 className="font-semibold">Industry Supervisor</h4>
                                                </div>
                                                <Button size="sm" variant="outline" disabled>
                                                    {student.assignedIndustrySupervisor ? "View" : "Assign"}
                                                </Button>
                                            </div>
                                            {student.assignedIndustrySupervisor ? (
                                                <div className="space-y-2">
                                                    <p className="font-medium">
                                                        {student.assignedIndustrySupervisor.fullName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.assignedIndustrySupervisor.companyName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {student.assignedIndustrySupervisor.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground italic">
                                                    No industry supervisor assigned
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Progress Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Progress Timeline</CardTitle>
                                    <CardDescription>
                                        Student's progress over time and recent activities
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {logbooks.slice(0, 5).map((logbook) => (
                                            <div key={logbook.id} className="flex items-start gap-4 p-3 border rounded-lg">
                                                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">
                                                            Week {logbook.weekNumber}: {logbook.title}
                                                        </h4>
                                                        <Badge className={getLogbookStatusColor(logbook.status)}>
                                                            {logbook.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {formatDate(logbook.startDate)} - {formatDate(logbook.endDate)}
                                                    </p>
                                                    <p className="text-sm mt-2 line-clamp-2">{logbook.weekSummary}</p>
                                                    {logbook.supervisorComment && (
                                                        <div className="mt-2 p-2 bg-muted rounded">
                                                            <p className="text-xs font-medium">Supervisor Comment:</p>
                                                            <p className="text-xs">{logbook.supervisorComment}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Logbooks Tab */}
                        <TabsContent value="logbooks">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Logbook Submissions</CardTitle>
                                    <CardDescription>
                                        All logbook submissions by this student
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {logbooks.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Week</TableHead>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Period</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Submitted</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {logbooks.map((logbook) => (
                                                    <TableRow key={logbook.id}>
                                                        <TableCell className="font-medium">
                                                            Week {logbook.weekNumber}
                                                        </TableCell>
                                                        <TableCell>{logbook.title}</TableCell>
                                                        <TableCell>
                                                            {formatDate(logbook.startDate)} - {formatDate(logbook.endDate)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getLogbookStatusColor(logbook.status)}>
                                                                {logbook.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{formatDate(logbook.createdAt)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8">
                                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold">No Logbooks Submitted</h3>
                                            <p className="text-muted-foreground">
                                                This student hasn't submitted any logbooks yet.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Defense Tab */}
                        <TabsContent value="defense">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Defense Information</CardTitle>
                                    <CardDescription>
                                        Defense schedule and results for this student
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {defense ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                            Defense Date
                                                        </label>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{formatDate(defense.defenseDate)}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                            Time
                                                        </label>
                                                        <p className="mt-1">{defense.defenseTime}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                            Venue
                                                        </label>
                                                        <p className="mt-1">{defense.venue}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                            Status
                                                        </label>
                                                        <div className="mt-1">
                                                            <Badge className={
                                                                defense.status === "SCHEDULED" ? "bg-blue-100 text-blue-800" :
                                                                    defense.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                                                        "bg-red-100 text-red-800"
                                                            }>
                                                                {defense.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {defense.score && (
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Score
                                                            </label>
                                                            <p className="text-2xl font-bold mt-1">{defense.score}/100</p>
                                                        </div>
                                                    )}
                                                    {defense.remarks && (
                                                        <div>
                                                            <label className="text-sm font-medium text-muted-foreground">
                                                                Remarks
                                                            </label>
                                                            <p className="mt-1">{defense.remarks}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {defense.panelMembers && defense.panelMembers.length > 0 && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Panel Members</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {defense.panelMembers.map((member, index) => (
                                                            <Badge key={index} variant="outline">
                                                                {member}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold">No Defense Scheduled</h3>
                                            <p className="text-muted-foreground mb-4">
                                                This student doesn't have a defense scheduled yet.
                                            </p>
                                            <Button>Schedule Defense</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default HODStudentDetails;
