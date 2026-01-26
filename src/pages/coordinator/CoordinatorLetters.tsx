import { useState, useEffect } from "react";
import {
    FileText,
    Upload,
    Search,
    Eye,
    Trash2,
    Loader2,
    CheckCircle2,
    User,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Student {
    id: string;
    fullName: string;
    matricNumber: string;
    department: string;
}

interface Letter {
    id: string;
    studentId: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: string;
    createdAt: string;
}

const CoordinatorLetters = () => {
    const { toast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [letters, setLetters] = useState<Letter[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [studentsRes, lettersRes] = await Promise.all([
                api.get("/students"),
                api.get("/letter/all")
            ]);
            setStudents(studentsRes.data?.data?.students || []);
            setLetters(lettersRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (studentId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(studentId);
        const formData = new FormData();
        formData.append("letter", file);
        formData.append("studentId", studentId);
        formData.append("type", "APPLICATION");

        try {
            await api.post("/letter", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast({
                title: "Success",
                description: "Application letter uploaded successfully.",
            });
            fetchData();
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.response?.data?.error || "Error uploading file.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(null);
        }
    };

    const filteredStudents = Array.isArray(students) ? students.filter(s =>
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        s.matricNumber.toLowerCase().includes(search.toLowerCase())
    ) : [];

    const getStudentLetter = (studentId: string) => {
        return letters.find(l => l.studentId === studentId && l.type === "APPLICATION");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">SIWES Application Letters</h1>
                <p className="text-gray-600">Upload and manage SIWES application letters for students.</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search students by name or matric number..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="h-16 px-6 bg-gray-50/50"></td>
                                        </tr>
                                    ))
                                ) : filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => {
                                        const letter = getStudentLetter(student.id);
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{student.fullName}</div>
                                                    <div className="text-xs text-gray-500">{student.matricNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {student.department}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {letter ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Uploaded
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                                                            Not Uploaded
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {letter && (
                                                            <Button variant="outline" size="sm" asChild>
                                                                <a href={letter.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                    <Eye className="w-4 h-4 mr-1" /> View
                                                                </a>
                                                            </Button>
                                                        )}
                                                        <input
                                                            type="file"
                                                            id={`upload-${student.id}`}
                                                            className="hidden"
                                                            onChange={(e) => handleFileUpload(student.id, e)}
                                                            accept=".pdf,.doc,.docx"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant={letter ? "outline" : "default"}
                                                            disabled={isUploading === student.id}
                                                            onClick={() => document.getElementById(`upload-${student.id}`)?.click()}
                                                        >
                                                            {isUploading === student.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-4 h-4 mr-1" />
                                                                    {letter ? "Re-upload" : "Upload Letter"}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No students found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CoordinatorLetters;
