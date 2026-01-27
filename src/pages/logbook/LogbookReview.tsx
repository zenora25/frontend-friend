import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    MessageSquare,
    AlertCircle,
    Loader2,
    RefreshCw,
    ImageIcon,
    Download,
    Eye,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { logbookAPI } from "@/lib/api";

const LogbookReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [logbook, setLogbook] = useState<any>(null);
    const [review, setReview] = useState<{
        status: "APPROVED" | "REVISION";
        comment: string;
    }>({
        status: "APPROVED",
        comment: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchLogbook();
    }, [id]);

    const fetchLogbook = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!id) return;
            const response = await logbookAPI.getById(id!);
            console.log("📥 Logbook response:", response.data);

            // Backend returns { success: true, logbook: { ... } }
            if (response.data && response.data.logbook) {
                setLogbook(response.data.logbook);
            } else if (response.data && response.data.success === false) {
                setError(response.data.error || "Failed to load logbook");
            } else {
                setLogbook(response.data);
            }
        } catch (err: any) {
            console.error("Failed to fetch logbook:", err);

            // Extract error message from axios error response if available
            const backendError = err.response?.data?.error;
            const backendDetails = err.response?.data?.details;

            const errorMessage = backendError
                ? `${backendError}${backendDetails ? `: ${backendDetails}` : ''}`
                : "Failed to load logbook. You might not have permission to view it.";

            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
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

    const handleSubmit = async () => {
        if (!review.comment.trim() && review.status === "REVISION") {
            toast({
                title: "Comment required",
                description: "Please provide feedback for revision",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await logbookAPI.reviewLogbook(id!, review);
            toast({
                title: "Review submitted",
                description: "Logbook has been reviewed successfully",
            });
            navigate("/dashboard/supervisor-dashboard");
        } catch (err: any) {
            toast({
                title: "Submission failed",
                description: err.error || "Please try again",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Loading logbook Review...</p>
                </div>
            </div>
        );
    }

    if (error || !logbook) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-red-50 flex items-center justify-center rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Review unavailable</h2>
                <p className="text-gray-600 mb-6 max-w-md">{error || "The logbook could not be loaded or you don't have permission to review it."}</p>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                    <Button onClick={fetchLogbook} variant="secondary">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review Logbook</h1>
                    <p className="text-gray-600">
                        Week {logbook.weekNumber} by {logbook.student?.fullName || logbook.Student?.fullName}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border border-gray-200 bg-white">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <CardTitle className="text-gray-900">{logbook.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { day: "Monday", activity: logbook.mondayActivities },
                                { day: "Tuesday", activity: logbook.tuesdayActivities },
                                { day: "Wednesday", activity: logbook.wednesdayActivities },
                                { day: "Thursday", activity: logbook.thursdayActivities },
                                { day: "Friday", activity: logbook.fridayActivities },
                            ].map((item) => (
                                <div key={item.day} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">{item.day}</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-line">
                                        {item.activity || "No activities recorded"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2 text-gray-900">Weekly Summary</h3>
                            <p className="whitespace-pre-line text-gray-700">{logbook.weekSummary}</p>
                        </div>

                        {logbook.challengesFaced && (
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-900">Challenges Faced</h3>
                                <p className="whitespace-pre-line text-gray-700">{logbook.challengesFaced}</p>
                            </div>
                        )}

                        {logbook.lessonsLearned && (
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-900">Lessons Learned</h3>
                                <p className="whitespace-pre-line text-gray-700">{logbook.lessonsLearned}</p>
                            </div>
                        )}

                        {logbook.skillsAcquired && (
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-900">Skills Acquired</h3>
                                <p className="whitespace-pre-line text-gray-700">{logbook.skillsAcquired}</p>
                            </div>
                        )}

                        {/* Images Section */}
                        {logbook.images && logbook.images.length > 0 && (
                            <div className="pt-4 border-t border-gray-100">
                                <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-gray-500" />
                                    Supporting Images & Documents
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {logbook.images.map((image: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                            <div className="relative group">
                                                {image.url && (
                                                    <>
                                                        <img
                                                            src={image.url}
                                                            alt={`Attachment ${index + 1}`}
                                                            className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => openImageModal(image.url)}
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="bg-white/90 hover:bg-white text-gray-900 h-8 w-8"
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
                                                                className="bg-white/90 hover:bg-white text-gray-900 h-8 w-8"
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
                                            <div className="p-2 bg-white">
                                                <p className="text-xs font-medium text-gray-900 truncate">{image.filename}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <CardTitle className="text-gray-900">Review & Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-3">
                            <Label className="text-gray-900">Decision</Label>
                            <RadioGroup value={review.status} onValueChange={(value: "APPROVED" | "REVISION") => setReview({ ...review, status: value })}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="APPROVED" id="approved" />
                                    <Label htmlFor="approved" className="flex items-center gap-2 text-gray-700">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Approve
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="REVISION" id="revision" />
                                    <Label htmlFor="revision" className="flex items-center gap-2 text-gray-700">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                        Needs Revision
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="comment" className="flex items-center gap-2 text-gray-900">
                                <MessageSquare className="w-4 h-4 text-gray-600" />
                                Feedback
                            </Label>
                            <Textarea
                                id="comment"
                                placeholder="Provide constructive feedback for the student..."
                                value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                rows={6}
                                className="border-gray-300 focus:border-gray-400"
                            />
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Image Modal Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] bg-white border-none shadow-2xl">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="flex items-center justify-between">
                            <span className="text-gray-900 font-bold">Attachment Preview</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-8 w-8 rounded-full hover:bg-gray-100"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-6 bg-gray-50/50">
                        {selectedImage && (
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-inner"
                            />
                        )}
                    </div>
                    {selectedImage && (
                        <div className="flex justify-center gap-4 pt-4 border-t">
                            <Button
                                variant="outline"
                                className="border-gray-300 hover:bg-gray-50"
                                onClick={() => {
                                    if (selectedImage) {
                                        const filename = selectedImage.split('/').pop() || 'attachment';
                                        handleDownloadImage(selectedImage, filename);
                                    }
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download File
                            </Button>
                            <Button
                                variant="outline"
                                className="border-gray-300 hover:bg-gray-50"
                                onClick={() => window.open(selectedImage, '_blank')}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                View Full Size
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LogbookReview;