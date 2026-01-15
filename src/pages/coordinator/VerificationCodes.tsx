import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Key,
    Plus,
    Search,
    Filter,
    Trash2,
    Copy,
    CheckCircle2,
    Clock,
    AlertCircle,
    Mail,
    FileText,
    Loader2,
    RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { coordinatorAPI } from "@/lib/api";

const VerificationCodes = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [bulkEmails, setBulkEmails] = useState("");
    const [bulkDepartment, setBulkDepartment] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["verification-codes", search, statusFilter],
        queryFn: async () => {
            const response = await coordinatorAPI.getVerificationCodes({
                email: search || undefined,
                isUsed: statusFilter === "used" ? true : statusFilter === "unused" ? false : undefined
            });
            return response.data;
        }
    });

    const generateBulkMutation = useMutation({
        mutationFn: async () => {
            const emails = bulkEmails.split(/[\n,]/).map(e => e.trim()).filter(e => e);
            return await coordinatorAPI.bulkGenerateCodes({
                emails,
                department: bulkDepartment
            });
        },
        onSuccess: (response: any) => {
            toast({
                title: "Codes Generated",
                description: `Successfully generated ${response.data.generatedCodes.length} verification codes.`,
            });
            setIsBulkDialogOpen(false);
            setBulkEmails("");
            setBulkDepartment("");
            queryClient.invalidateQueries({ queryKey: ["verification-codes"] });
        },
        onError: (error: any) => {
            toast({
                title: "Generation Failed",
                description: error.response?.data?.error || "Failed to generate codes. Please check the email formats.",
                variant: "destructive",
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return await coordinatorAPI.deleteVerificationCode(id);
        },
        onSuccess: () => {
            toast({
                title: "Code Deleted",
                description: "The verification code has been deleted.",
            });
            queryClient.invalidateQueries({ queryKey: ["verification-codes"] });
        },
        onError: (error: any) => {
            toast({
                title: "Delete Failed",
                description: error.response?.data?.error || "Failed to delete code.",
                variant: "destructive",
            });
        }
    });

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({
            title: "Copied!",
            description: "Code copied to clipboard.",
        });
    };

    const codes = data?.codes || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verification Codes</h1>
                    <p className="text-gray-500">Manage student registration codes and onboarding</p>
                </div>

                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 shadow-sm bg-gray-900 hover:bg-gray-800">
                            <Plus className="w-4 h-4" />
                            Bulk Generate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Bulk Generate Codes</DialogTitle>
                            <DialogDescription>
                                Enter student emails (separated by commas or new lines) and select their department.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Student Emails</label>
                                <Textarea
                                    placeholder="student1@example.com, student2@example.com..."
                                    className="h-32 resize-none"
                                    value={bulkEmails}
                                    onChange={(e) => setBulkEmails(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select value={bulkDepartment} onValueChange={setBulkDepartment}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
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
                            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={() => generateBulkMutation.mutate()}
                                disabled={!bulkEmails || !bulkDepartment || generateBulkMutation.isPending}
                                className="bg-gray-900 hover:bg-gray-800"
                            >
                                {generateBulkMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    "Generate Codes"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-3 border-gray-200 shadow-sm">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 italic">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Key className="w-5 h-5 text-gray-500" />
                                Active Codes
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by email..."
                                        className="pl-9 w-64 bg-white"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-32 bg-white">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="unused">Unused</SelectItem>
                                        <SelectItem value="used">Used</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email & Code</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires At</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/30"></td>
                                            </tr>
                                        ))
                                    ) : codes.length > 0 ? (
                                        codes.map((code: any) => (
                                            <tr key={code.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{code.email}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <code className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-mono font-bold text-gray-700">
                                                                {code.code}
                                                            </code>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => copyToClipboard(code.code)}
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {code.department}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {code.isUsed ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 font-normal">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Used
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-gray-500 border-gray-200 flex w-fit gap-1 font-normal">
                                                            <Clock className="w-3 h-3" />
                                                            Unused
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(code.expiresAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!code.isUsed && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => deleteMutation.mutate(code.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Key className="w-12 h-12 text-gray-200" />
                                                    <p className="text-lg font-medium text-gray-600">No codes found</p>
                                                    <p className="text-sm">Try adjusting your filters or search query</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Total Generated</div>
                            <div className="text-3xl font-bold text-gray-900">{codes.length}</div>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50/50 border border-green-100">
                            <div className="text-sm text-green-600 mb-1 font-medium">Used Codes</div>
                            <div className="text-3xl font-bold text-green-700">
                                {codes.filter((c: any) => c.isUsed).length}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                            <div className="text-sm text-orange-600 mb-1 font-medium">Unused Codes</div>
                            <div className="text-3xl font-bold text-orange-700">
                                {codes.filter((c: any) => !c.isUsed).length}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <AlertCircle className="w-3 h-3" />
                                Codes expire after 7 days
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default VerificationCodes;
