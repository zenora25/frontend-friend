import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const mockDefenseData = {
  scheduled: {
    date: "2024-06-20",
    time: "10:00 AM",
    venue: "Room 204, Faculty of Computing",
    duration: "30 minutes",
    panel: [
      { name: "Dr. Sarah Johnson", role: "Chair" },
      { name: "Prof. Michael Adeyemi", role: "Internal Examiner" },
      { name: "Mr. James Obi", role: "Industry Representative" },
    ],
  },
  requirements: [
    { id: 1, title: "Complete all weekly logbooks", completed: true },
    { id: 2, title: "Get supervisor approval for all entries", completed: true },
    { id: 3, title: "Submit final SIWES report", completed: false },
    { id: 4, title: "Upload presentation slides", completed: false },
    { id: 5, title: "Supervisor final assessment", completed: true },
  ],
  documents: [
    { name: "SIWES Report Template", type: "template", size: "245 KB" },
    { name: "Presentation Guidelines", type: "pdf", size: "156 KB" },
    { name: "Defense Rubric", type: "pdf", size: "89 KB" },
  ],
};

const StudentDefense = () => {
  const completedRequirements = mockDefenseData.requirements.filter((r) => r.completed).length;
  const totalRequirements = mockDefenseData.requirements.length;
  const progressPercentage = (completedRequirements / totalRequirements) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Defense Schedule</h1>
        <p className="text-muted-foreground">
          View your defense schedule and prepare for your SIWES presentation.
        </p>
      </div>

      {/* Defense schedule card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Defense Session</CardTitle>
            <Badge className="bg-chart-5/20 text-chart-5">Scheduled</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-accent">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium text-foreground">{mockDefenseData.scheduled.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium text-foreground">{mockDefenseData.scheduled.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="font-medium text-foreground">{mockDefenseData.scheduled.venue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-accent">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">{mockDefenseData.scheduled.duration}</p>
              </div>
            </div>
          </div>

          {/* Panel members */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Defense Panel</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockDefenseData.scheduled.panel.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-accent">
                  <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Requirements checklist */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Defense Requirements</CardTitle>
              <span className="text-sm text-muted-foreground">
                {completedRequirements}/{totalRequirements} completed
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="space-y-3">
              {mockDefenseData.requirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className={`flex items-center gap-3 p-3 ${
                    requirement.completed ? "bg-chart-5/10" : "bg-accent"
                  }`}
                >
                  {requirement.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-chart-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span
                    className={`text-sm ${
                      requirement.completed
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {requirement.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resources & Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockDefenseData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-card flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {doc.type} • {doc.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="pt-4 space-y-2">
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Upload Final Report
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Upload Presentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDefense;
