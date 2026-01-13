import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, MessageSquare, AlertCircle } from "lucide-react";
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

    useEffect(() => {
        fetchLogbook();
    }, [id]);

    const fetchLogbook = async () => {
        try {
            const response = await logbookAPI.getById(id!);
            setLogbook(response.data);
        } catch (error) {
            console.error("Failed to fetch logbook:", error);
            toast({
                title: "Error",
                description: "Failed to load logbook",
                variant: "destructive",
            });
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
        } catch (error: any) {
            toast({
                title: "Submission failed",
                description: error.response?.data?.error || "Please try again",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!logbook) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading logbook...</p>
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
                        Week {logbook.weekNumber} by {logbook.Student?.fullName}
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
                            <RadioGroup value={review.status} onValueChange={(value: "APPROVED" | "REVISION") => setReview({...review, status: value})}>
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
                                onChange={(e) => setReview({...review, comment: e.target.value})}
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