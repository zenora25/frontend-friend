import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    MoreVertical,
    Mail,
    GraduationCap,
    Building2,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { hodAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Students = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, error } = useQuery({
        queryKey: ["students", search, status, page],
        queryFn: async () => {
            // Use HOD API to get department students
            const response = await hodAPI.getDepartmentStudents({
                search,
                status: status === "all" ? undefined : status,
                page,
                limit
            });
            return response.data;
        }
    });

    const students = data?.students || [];
    const pagination = data?.pagination || { total: 0, pages: 1 };

    const getStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case "ACTIVE":
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Active</Badge>;
            case "COMPLETED":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Completed</Badge>;
            case "PENDING":
                return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200">Pending</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Management</h1>
                    <p className="text-gray-500">Monitor and manage all students in the SIWES program</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Data
                    </Button>
                </div>
            </div>

            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            Student List
                            <Badge variant="secondary" className="ml-2 font-normal">
                                {pagination.total} Total
                            </Badge>
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search students..."
                                    className="pl-9 bg-white border-gray-200 focus:ring-gray-900"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[140px] bg-white border-gray-200">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department & Matric</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-8">
                                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : students.length > 0 ? (
                                    students.map((student: any) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold border-2 border-white shadow-sm">
                                                        {student.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{student.fullName}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {student.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">{student.matricNumber}</span>
                                                    <span className="text-xs">{student.department}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="max-w-[200px] truncate">
                                                    {student.companyName || "Not assigned"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-40 space-y-1.5">
                                                    <div className="flex items-center justify-between text-[10px] font-medium text-gray-500">
                                                        <span>{student.progress}% Complete</span>
                                                    </div>
                                                    <Progress
                                                        value={student.progress}
                                                        className="h-1.5 bg-gray-100"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(student.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2">
                                                            <Eye className="w-4 h-4" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2">
                                                            <Mail className="w-4 h-4" />
                                                            Email Student
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 gap-2">
                                                            <AlertCircle className="w-4 h-4" />
                                                            Flag Student
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-12 h-12 text-gray-200" />
                                                <p className="text-lg font-medium text-gray-600">No students found</p>
                                                <p className="text-sm">Try adjusting your filters or search query</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{(page - 1) * limit + 1}</span> to{" "}
                            <span className="text-gray-900">{Math.min(page * limit, pagination.total)}</span> of{" "}
                            <span className="text-gray-900">{pagination.total}</span> students
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-gray-200"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="text-sm font-medium px-4">
                                Page {page} of {pagination.pages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-gray-200"
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.pages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Students;
