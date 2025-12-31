import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Sparkles,
  Timer,
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
      { name: "Dr. Sarah Johnson", role: "Chair", initials: "SJ" },
      { name: "Prof. Michael Adeyemi", role: "Internal Examiner", initials: "MA" },
      { name: "Mr. James Obi", role: "Industry Representative", initials: "JO" },
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
    { name: "SIWES Report Template", type: "TEMPLATE", size: "245 KB" },
    { name: "Presentation Guidelines", type: "PDF", size: "156 KB" },
    { name: "Defense Rubric", type: "PDF", size: "89 KB" },
  ],
};

const StudentDefense = () => {
  const completedRequirements = mockDefenseData.requirements.filter((r) => r.completed).length;
  const totalRequirements = mockDefenseData.requirements.length;
  const progressPercentage = (completedRequirements / totalRequirements) * 100;

  return (
    <div className="space-y-8">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden p-6 -mx-4 lg:-mx-8 -mt-4 lg:-mt-8 bg-gradient-to-r from-primary via-secondary to-primary">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">Defense Schedule</h1>
              <p className="text-primary-foreground/70">
                View your defense schedule and prepare for your SIWES presentation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Defense schedule card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-1 bg-gradient-to-r from-primary via-chart-2 to-chart-5" />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-5/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-chart-5" />
              </div>
              <CardTitle className="text-xl">Your Defense Session</CardTitle>
            </div>
            <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/30 px-3 py-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Scheduled
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Schedule details grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: "Date", value: mockDefenseData.scheduled.date, color: "from-primary/20 to-primary/5" },
              { icon: Clock, label: "Time", value: mockDefenseData.scheduled.time, color: "from-chart-2/20 to-chart-2/5" },
              { icon: MapPin, label: "Venue", value: mockDefenseData.scheduled.venue, color: "from-chart-5/20 to-chart-5/5" },
              { icon: Timer, label: "Duration", value: mockDefenseData.scheduled.duration, color: "from-secondary/20 to-secondary/5" },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`group relative p-4 bg-gradient-to-br ${item.color} border border-border/50 hover:border-primary/30 transition-all hover:-translate-y-0.5`}
              >
                <item.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="font-semibold text-foreground mt-1 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Panel members */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Defense Panel
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockDefenseData.scheduled.panel.map((member, index) => (
                <div 
                  key={index} 
                  className="group flex items-center gap-4 p-4 bg-gradient-to-br from-card to-accent/30 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-semibold text-sm">{member.initials}</span>
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
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-primary to-chart-2" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Defense Requirements</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{completedRequirements}</span>
                <span className="text-muted-foreground">/ {totalRequirements}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative">
              <Progress value={progressPercentage} className="h-3" />
              <div 
                className="absolute top-0 h-3 bg-gradient-to-r from-primary to-chart-5 transition-all"
                style={{ width: `${progressPercentage}%`, borderRadius: 'inherit' }}
              />
            </div>
            
            <div className="space-y-2">
              {mockDefenseData.requirements.map((requirement, index) => (
                <div
                  key={requirement.id}
                  className={`group flex items-center gap-3 p-4 border transition-all hover:-translate-x-1 ${
                    requirement.completed 
                      ? "bg-chart-5/5 border-chart-5/20" 
                      : "bg-card border-border/50 hover:border-primary/30"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                    requirement.completed 
                      ? "bg-chart-5/20" 
                      : "bg-muted/30"
                  }`}>
                    {requirement.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-chart-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    requirement.completed ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {requirement.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-chart-2 to-chart-5" />
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resources & Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDefenseData.documents.map((doc, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-card to-accent/20 border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="inline-block px-2 py-0.5 bg-muted/50 mr-2">{doc.type}</span>
                      {doc.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-50 group-hover:opacity-100 transition-opacity">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="pt-4 space-y-3">
              <Button className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                <FileText className="w-4 h-4 mr-2" />
                Upload Final Report
              </Button>
              <Button variant="outline" className="w-full h-12 border-2 hover:bg-accent">
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