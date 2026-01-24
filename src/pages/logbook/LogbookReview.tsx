import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, MessageSquare, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
            } else if (response.data && !response.data.success) {
                setError(response.data.error || "Failed to load logbook");
            } else {
                setLogbook(response.data);
            }
        } catch (err: any) {
            console.error("Failed to fetch logbook:", err);
            const errorMessage = err.error || "Failed to load logbook. You might not have permission to view it.";
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
        </div>
    );
};

export default LogbookReview;