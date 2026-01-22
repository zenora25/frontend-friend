import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Building, MapPin, GraduationCap, Calendar, BookText, CheckCircle2, Clock, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { institutionSupervisorAPI, studentAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const StudentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [student, setStudent] = useState<any>(null);
    const [logbooks, setLogbooks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch student details
            // Use different API based on role if needed, but the endpoint currently used by institutionSupervisorAPI is generic /students/:id
            const studentRes = await institutionSupervisorAPI.getStudentDetails(id!);
            setStudent(studentRes.data.student || studentRes.data); // Handle potential response wrapper

            // Fetch logbooks
            const logbooksRes = await institutionSupervisorAPI.getStudentLogbooks(id!);
            setLogbooks(logbooksRes.data.logbooks || []);

        } catch (error) {
            console.error("Failed to fetch student details:", error);
            toast({
                title: "Error",
                description: "Failed to load student details",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-green-100 text-green-800">Active</Badge>;
            case "COMPLETED":
                return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getLogbookStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
            case "PENDING":
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
            case "REVISION":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Revision</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Student not found</p>
                <Button variant="link" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    // Calculate stats
    const totalLogbooks = logbooks.length;
    const approvedLogbooks = logbooks.filter(l => l.status === "APPROVED").length;
    const completionRate = totalLogbooks > 0 ? Math.round((approvedLogbooks / 24) * 100) : 0; // Assuming 24 weeks

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{student.fullName}</h1>
                    <p className="text-muted-foreground">{student.matricNumber}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Student Profile Card */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-2xl">
                                    {student.fullName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{student.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">{student.department}</p>
                            </div>
                            {getStatusBadge(student.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{student.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                <span>{student.companyName || "No Company Assigned"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{student.companyAddress || "No Address"}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Program Progress</span>
                                <span className="text-sm text-muted-foreground">{student.progress}%</span>
                            </div>
                            <Progress value={student.progress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                {/* Logbooks & Stats */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <BookText className="w-8 h-8 text-blue-500 mb-2" />
                                <div className="text-2xl font-bold">{totalLogbooks}</div>
                                <div className="text-xs text-muted-foreground">Total Entries</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                                <div className="text-2xl font-bold">{approvedLogbooks}</div>
                                <div className="text-xs text-muted-foreground">Approved</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <Clock className="w-8 h-8 text-amber-500 mb-2" />
                                <div className="text-2xl font-bold">{totalLogbooks - approvedLogbooks}</div>
                                <div className="text-xs text-muted-foreground">Pending/Revision</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Logbook History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {logbooks.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">No logbook entries found.</p>
                                ) : (
                                    logbooks.map((logbook) => (
                                        <div key={logbook.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">Week {logbook.weekNumber}</span>
                                                    {getLogbookStatusBadge(logbook.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{logbook.title}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(logbook.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/logbook/${logbook.id}/review`)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
