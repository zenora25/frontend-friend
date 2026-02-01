import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    Filter,
    User,
    Mail,
    Building,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { hodAPI, studentAPI, institutionSupervisorAPI, industrySupervisorAPI } from "@/lib/api";

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
        email: string;
    };
}

interface Supervisor {
    id: string;
    fullName: string;
    email: string;
    department: string;
    assignedStudentsCount: number;
    reviewRate: number;
    companyName?: string;
}

const HODAssignStudent = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
    const [industrySupervisors, setIndustrySupervisors] = useState<Supervisor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | null>(null);
    const [supervisorType, setSupervisorType] = useState<"institution" | "industry">("institution");
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);

    useEffect(() => {
        fetchUnassignedStudents();
        fetchSupervisors();
        fetchIndustrySupervisors();
    }, [statusFilter, searchQuery]);

    const fetchUnassignedStudents = async () => {
        try {
            const params: any = {
                page: 1,
                limit: 50,
                status: "ACTIVE",
            };

            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await hodAPI.getDepartmentStudents(params);
            const allStudents = response.data.students || [];

            // Filter for unassigned students (missing either institution or industry supervisor)
            const unassignedStudents = allStudents.filter(
                (student: Student) => !student.Supervisor || !student.IndustrySupervisor
            );

            setStudents(unassignedStudents);
        } catch (error: any) {
            console.error("Failed to fetch students:", error);
            toast({
                title: "Error",
                description: "Failed to load students",
                variant: "destructive",
            });
        }
    };

    const fetchSupervisors = async () => {
        try {
            const response = await hodAPI.getSupervisorPerformance();
            const performanceData = response.data.supervisors || [];

            // Get all supervisors from department
            const supervisorsResponse = await institutionSupervisorAPI.getAll({
                department: "specific", // This would be HOD's department
                limit: 100,
            });

            const allSupervisors = supervisorsResponse.data || [];

            // Combine performance data with supervisor info
            const combined = allSupervisors.map((sup: any) => {
                const perf = performanceData.find((p: any) => p.supervisorId === sup.id);
                return {
                    id: sup.id,
                    fullName: sup.fullName,
                    email: sup.email,
                    department: sup.department,
                    assignedStudentsCount: perf?.assignedStudents || 0,
                    reviewRate: perf?.reviewRate || 0,
                    performanceScore: perf?.performanceScore || 0,
                };
            });

            setSupervisors(combined);
        } catch (error: any) {
            console.error("Failed to fetch supervisors:", error);
            toast({
                title: "Error",
                description: "Failed to load supervisors",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchIndustrySupervisors = async () => {
        try {
            const response = await industrySupervisorAPI.getAll();
            const allIndustrySupervisors = response.data || [];

            setIndustrySupervisors(allIndustrySupervisors.map((sup: any) => ({
                id: sup.id,
                fullName: sup.fullName,
                email: sup.email,
                department: sup.department || "Industry",
                companyName: sup.companyName,
                assignedStudentsCount: 0,
                reviewRate: 0,
            })));
        } catch (error: any) {
            console.error("Failed to fetch industry supervisors:", error);
        }
    };

    const handleOpenAssignDialog = (studentId: string) => {
        setSelectedStudentId(studentId);
        setSelectedSupervisorId(null);
        setSupervisorType("institution");
        setIsAssignDialogOpen(true);
    };

    const handleAssignSupervisor = async () => {
        if (!selectedStudentId || !selectedSupervisorId) {
            toast({
                title: "Error",
                description: "Please select both student and supervisor",
                variant: "destructive",
            });
            return;
        }

        setIsLoadingAssignment(true);
        try {
            await hodAPI.assignStudentToSupervisor({
                studentId: selectedStudentId,
                institutionSupervisorId: supervisorType === "institution" ? selectedSupervisorId : undefined,
                industrySupervisorId: supervisorType === "industry" ? selectedSupervisorId : undefined,
            });

            toast({
                title: "Success",
                description: "Student assigned to supervisor successfully",
            });

            setIsAssignDialogOpen(false);
            fetchUnassignedStudents();
            fetchSupervisors();
        } catch (error: any) {
            console.error("Failed to assign supervisor:", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to assign supervisor",
                variant: "destructive",
            });
        } finally {
            setIsLoadingAssignment(false);
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

    const getPerformanceColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800";
        if (score >= 60) return "bg-blue-100 text-blue-800";
        if (score >= 40) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const getPerformanceText = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Average";
        return "Needs Improvement";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/hod/dashboard")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground">Assign Students to Supervisors</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Assign institution supervisors to students in your department
                    </p>
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
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Students</SelectItem>
                            <SelectItem value="unassigned">Unassigned Only</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Unassigned Students */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Unassigned Students</CardTitle>
                        <CardDescription>
                            Students who need institution supervisor assignment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : students.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Matric Number</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Progress</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
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
                                                <Badge className={getStatusColor(student.status)}>
                                                    {student.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOpenAssignDialog(student.id)}
                                                >
                                                    Assign Supervisor
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold">All Students Assigned</h3>
                                <p className="text-muted-foreground">
                                    All students in your department have been assigned to supervisors.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Available Supervisors */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Supervisors</CardTitle>
                        <CardDescription>
                            Supervisors in your department
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {supervisors.slice(0, 5).map((supervisor) => (
                                <div
                                    key={supervisor.id}
                                    className="p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                                    onClick={() => setSelectedSupervisorId(supervisor.id)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{supervisor.fullName}</h4>
                                                <p className="text-xs text-muted-foreground">{supervisor.email}</p>
                                            </div>
                                        </div>
                                        {selectedSupervisorId === supervisor.id && (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Students:</span>
                                            <span className="font-medium ml-2">{supervisor.assignedStudentsCount}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Review Rate:</span>
                                            <span className="font-medium ml-2">{supervisor.reviewRate}%</span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <Badge className={getPerformanceColor(supervisor.reviewRate)}>
                                            {getPerformanceText(supervisor.reviewRate)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assign Dialog */}
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Supervisor</DialogTitle>
                        <DialogDescription>
                            Select a supervisor for the selected student
                        </DialogDescription>
                    </DialogHeader>

                    {selectedStudentId && (
                        <div className="space-y-4 py-4">
                            {/* Selected Student Info */}
                            <div className="p-3 bg-muted rounded-lg">
                                <h4 className="font-semibold mb-2">Selected Student</h4>
                                {(() => {
                                    const student = students.find(s => s.id === selectedStudentId);
                                    return student ? (
                                        <div>
                                            <p className="font-medium">{student.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{student.matricNumber}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {/* Supervisor Type Selection */}
                            <div className="space-y-3">
                                <Label>Supervisor Type</Label>
                                <RadioGroup
                                    value={supervisorType}
                                    onValueChange={(value: any) => {
                                        setSupervisorType(value);
                                        setSelectedSupervisorId(null);
                                    }}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="institution" id="type-institution" />
                                        <Label htmlFor="type-institution">Institution</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="industry" id="type-industry" />
                                        <Label htmlFor="type-industry">Industry</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Supervisor Selection */}
                            <div className="space-y-3">
                                <Label htmlFor="supervisor">Select {supervisorType === "institution" ? "Institution" : "Industry"} Supervisor</Label>
                                <RadioGroup
                                    value={selectedSupervisorId || ""}
                                    onValueChange={setSelectedSupervisorId}
                                >
                                    {(supervisorType === "institution" ? supervisors : industrySupervisors).map((supervisor) => (
                                        <div key={supervisor.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={supervisor.id} id={`supervisor-${supervisor.id}`} />
                                            <Label
                                                htmlFor={`supervisor-${supervisor.id}`}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{supervisor.fullName}</p>
                                                        <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant="outline" className="text-xs">
                                                            {supervisor.assignedStudentsCount} students
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${getPerformanceColor(supervisor.reviewRate)}`}
                                                    >
                                                        {supervisor.reviewRate}% review rate
                                                    </Badge>
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAssignDialogOpen(false)}
                            disabled={isLoadingAssignment}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssignSupervisor}
                            disabled={!selectedSupervisorId || isLoadingAssignment}
                        >
                            {isLoadingAssignment ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Assign Supervisor"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HODAssignStudent;