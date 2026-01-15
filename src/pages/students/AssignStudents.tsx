import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    UserPlus,
    Search,
    AlertCircle,
    CheckCircle2,
    Users,
    ShieldCheck,
    Building,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { hodAPI, supervisorsAPI } from "@/lib/api";

const AssignStudents = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [selectedSupervisor, setSelectedSupervisor] = useState<string>("");

    // Fetch unassigned students
    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ["unassigned-students", search],
        queryFn: async () => {
            const response = await hodAPI.getDepartmentStudents({
                search,
                limit: 100
            });
            // Filter for students without assigned supervisor in the frontend for now
            // or the API could handle it if we updated it
            return response.data.data.students.filter((s: any) => !s.assignedSupervisor);
        }
    });

    // Fetch supervisors
    const { data: supervisorsData, isLoading: supervisorsLoading } = useQuery({
        queryKey: ["department-supervisors"],
        queryFn: async () => {
            const response = await supervisorsAPI.getAll();
            return response.data;
        }
    });

    const assignMutation = useMutation({
        mutationFn: async ({ studentId, supervisorId }: { studentId: string; supervisorId: string }) => {
            return await hodAPI.assignStudent(studentId, supervisorId);
        },
        onSuccess: () => {
            toast({
                title: "Student assigned",
                description: "The student has been successfully assigned to the supervisor.",
            });
            queryClient.invalidateQueries({ queryKey: ["unassigned-students"] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: (error: any) => {
            toast({
                title: "Assignment failed",
                description: error.response?.data?.error || "Failed to assign student. Please try again.",
                variant: "destructive",
            });
        }
    });

    const students = studentsData || [];
    const supervisors = supervisorsData?.supervisors || [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assign Students</h1>
                <p className="text-gray-500">Pair unassigned students with institution supervisors</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            Unassigned Students
                        </CardTitle>
                        <CardDescription>
                            Select a student to assign them to a supervisor
                        </CardDescription>
                        <div className="relative pt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or matric number..."
                                className="pl-9 bg-white border-gray-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Matric Number</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Company</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {studentsLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : students.length > 0 ? (
                                        students.map((student: any) => (
                                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{student.fullName}</div>
                                                    <div className="text-xs text-gray-500">{student.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {student.matricNumber}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {student.companyName || "N/A"}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Select
                                                            onValueChange={(val) => setSelectedSupervisor(val)}
                                                            defaultValue={selectedSupervisor}
                                                        >
                                                            <SelectTrigger className="w-[200px] h-8 text-xs bg-white border-gray-200">
                                                                <SelectValue placeholder="Select Supervisor" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {supervisors.map((sup: any) => (
                                                                    <SelectItem key={sup.id} value={sup.id}>
                                                                        {sup.fullName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            size="sm"
                                                            className="h-8 gap-1 shadow-sm"
                                                            disabled={!selectedSupervisor || assignMutation.isPending}
                                                            onClick={() => assignMutation.mutate({
                                                                studentId: student.id,
                                                                supervisorId: selectedSupervisor
                                                            })}
                                                        >
                                                            {assignMutation.isPending ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <UserPlus className="w-3 h-3" />
                                                            )}
                                                            Assign
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="w-12 h-12 text-green-200" />
                                                    <p className="text-lg font-medium text-gray-600">All students assigned!</p>
                                                    <p className="text-sm">There are no unassigned students in your department.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-gray-500" />
                            Supervisors
                        </CardTitle>
                        <CardDescription>
                            Department supervisors and their workloads
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {supervisorsLoading ? (
                                <div className="space-y-3">
                                    <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                                    <div className="h-12 bg-gray-100 animate-pulse rounded"></div>
                                </div>
                            ) : supervisors.length > 0 ? (
                                supervisors.map((sup: any) => (
                                    <div key={sup.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-sm text-gray-900">{sup.fullName}</div>
                                            <Badge variant="outline" className="text-[10px] bg-white text-gray-500">
                                                {sup.email}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                Workload: Low
                                            </div>
                                            <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                Active
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No supervisors found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AssignStudents;
