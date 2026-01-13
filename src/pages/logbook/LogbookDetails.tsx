import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, FileText, ImageIcon, Download, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { logbookAPI } from "@/lib/api";

const LogbookDetails = () => {
    const { id } = useParams();
    const [logbook, setLogbook] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchLogbookDetails();
    }, [id]);

    const fetchLogbookDetails = async () => {
        try {
            const response = await logbookAPI.getById(id!);
            setLogbook(response.data);
        } catch (error) {
            console.error("Failed to fetch logbook details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-green-100 text-green-800 border-green-200";
            case "PENDING":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "REVISION":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const handleDownloadImage = (imageUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading logbook details...</p>
                </div>
            </div>
        );
    }

    if (!logbook) {
        return (
            <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Logbook not found</h2>
                <p className="text-gray-600 mb-6">The logbook you're looking for doesn't exist.</p>
                <Button asChild className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90">
                    <Link to="/dashboard/logbook">Back to Logbook</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <Link to="/dashboard/logbook">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Week {logbook.weekNumber}: {logbook.title}</h1>
                    <p className="text-gray-600">
                        {new Date(logbook.startDate).toLocaleDateString()} - {new Date(logbook.endDate).toLocaleDateString()}
                    </p>
                </div>
                <Badge className={getStatusColor(logbook.status)}>{logbook.status}</Badge>
            </div>

            {/* Images Section */}
            {logbook.images && logbook.images.length > 0 && (
                <Card className="border border-gray-200 bg-white">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                            <ImageIcon className="w-5 h-5" />
                            Supporting Images & Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {logbook.images.map((image: any, index: number) => (
                                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                    <div className="relative group">
                                        {image.url.includes('/uploads/logbooks/') && (
                                            <>
                                                <img
                                                    src={image.url}
                                                    alt={`Attachment ${index + 1}`}
                                                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => openImageModal(image.url)}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-white/90 hover:bg-white text-gray-900"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openImageModal(image.url);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="bg-white/90 hover:bg-white text-gray-900"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadImage(image.url, image.filename);
                                                        }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-gray-900 truncate">{image.filename}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new URL(image.url).pathname.split('.').pop()?.toUpperCase()} File
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border border-gray-200 bg-white">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <CardTitle className="text-gray-900">Weekly Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="whitespace-pre-line text-gray-700">{logbook.weekSummary}</p>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <CardTitle className="text-gray-900">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span>Week {logbook.weekNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span>Submitted: {new Date(logbook.createdAt).toLocaleDateString()}</span>
                        </div>
                        {logbook.supervisorComment && (
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Supervisor Feedback</h4>
                                <p className="text-sm text-gray-600">{logbook.supervisorComment}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Image Modal Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Image Preview</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-8 w-8"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        )}
                    </div>
                    {selectedImage && (
                        <div className="flex justify-center gap-4">
                            <Button
                                variant="outline"
                                className="border-gray-300"
                                onClick={() => {
                                    if (selectedImage) {
                                        const filename = selectedImage.split('/').pop() || 'image';
                                        handleDownloadImage(selectedImage, filename);
                                    }
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gray-300"
                                onClick={() => window.open(selectedImage, '_blank')}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Open in New Tab
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LogbookDetails;