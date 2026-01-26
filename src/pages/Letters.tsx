import { useState, useEffect } from "react";
import {
    FileText,
    Upload,
    Download,
    Eye,
    Trash2,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Letter {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: string;
    createdAt: string;
}

const Letters = () => {
    const { toast } = useToast();
    const [letters, setLetters] = useState<Letter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchLetters();
    }, []);

    const fetchLetters = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/letter");
            setLetters(response.data || []);
        } catch (error) {
            console.error("Failed to fetch letters:", error);
            toast({
                title: "Error",
                description: "Failed to load letters.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "File size should be less than 5MB.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("letter", file);

        try {
            await api.post("/letter", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast({
                title: "Success",
                description: "Letter uploaded successfully.",
            });
            fetchLetters();
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.response?.data?.error || "Error uploading file.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            await api.delete(`/letter/${id}`);
            toast({
                title: "Deleted",
                description: "Document removed successfully.",
            });
            fetchLetters();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete document.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">SIWES Letters</h1>
                    <p className="text-gray-600">
                        Upload and manage your acceptance and completion letters.
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        id="letter-upload"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={isUploading}
                    />
                    <Button disabled={isUploading} onClick={() => document.getElementById('letter-upload')?.click()}>
                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Upload Letter
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : letters.length > 0 ? (
                    letters.map((letter) => (
                        <Card key={letter.id} className="overflow-hidden border-gray-200">
                            <CardHeader className="bg-gray-50 border-b p-4">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-white rounded shadow-sm">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        Uploaded
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-gray-900 truncate mb-1">
                                    {letter.fileName}
                                </h3>
                                <p className="text-xs text-gray-500 mb-4">
                                    Uploaded on {new Date(letter.createdAt).toLocaleDateString()}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <a href={letter.fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </a>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDelete(letter.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full border-dashed border-2 bg-gray-50">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No letters uploaded</h3>
                            <p className="text-gray-500 mb-6">You haven't uploaded any SIWES letters yet.</p>
                            <Button variant="outline" onClick={() => document.getElementById('letter-upload')?.click()}>
                                Upload Your First Letter
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default Letters;
