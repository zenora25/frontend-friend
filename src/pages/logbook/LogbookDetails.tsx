import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { logbookAPI } from "@/lib/api";

const LogbookDetails = () => {
    const { id } = useParams();
    const [logbook, setLogbook] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!logbook) {
        return <div>Logbook not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/logbook">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Week {logbook.weekNumber}: {logbook.title}</h1>
                    <p className="text-muted-foreground">
                        {new Date(logbook.startDate).toLocaleDateString()} - {new Date(logbook.endDate).toLocaleDateString()}
                    </p>
                </div>
                <Badge className="ml-auto">{logbook.status}</Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Weekly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-line">{logbook.weekSummary}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Week {logbook.weekNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Submitted: {new Date(logbook.createdAt).toLocaleDateString()}</span>
                        </div>
                        {logbook.supervisorComment && (
                            <div>
                                <h4 className="font-semibold mb-2">Supervisor Feedback</h4>
                                <p className="text-sm text-muted-foreground">{logbook.supervisorComment}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LogbookDetails;