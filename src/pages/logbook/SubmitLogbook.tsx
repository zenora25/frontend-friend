import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Send, Calendar, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SubmitLogbook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    weekNumber: "",
    startDate: "",
    endDate: "",
    title: "",
    mondayActivities: "",
    tuesdayActivities: "",
    wednesdayActivities: "",
    thursdayActivities: "",
    fridayActivities: "",
    weekSummary: "",
    challengesFaced: "",
    lessonsLearned: "",
    skillsAcquired: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your logbook entry has been saved as a draft.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Logbook submitted",
        description: "Your weekly logbook entry has been submitted for review.",
      });
      navigate("/logbook");
    }, 1000);
  };

  const days = [
    { key: "mondayActivities", label: "Monday" },
    { key: "tuesdayActivities", label: "Tuesday" },
    { key: "wednesdayActivities", label: "Wednesday" },
    { key: "thursdayActivities", label: "Thursday" },
    { key: "fridayActivities", label: "Friday" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Submit Logbook Entry</h1>
          <p className="text-muted-foreground">
            Document your weekly activities and learning experiences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Week details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Week Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekNumber">Week Number</Label>
                <Input
                  id="weekNumber"
                  type="number"
                  placeholder="e.g., 8"
                  value={formData.weekNumber}
                  onChange={(e) => handleChange("weekNumber", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Week Title/Theme</Label>
              <Input
                id="title"
                placeholder="e.g., API Development & Testing"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Daily activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Daily Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {days.map((day) => (
              <div key={day.key} className="space-y-2">
                <Label htmlFor={day.key}>{day.label}</Label>
                <Textarea
                  id={day.key}
                  placeholder={`Describe your activities for ${day.label}...`}
                  value={formData[day.key as keyof typeof formData]}
                  onChange={(e) => handleChange(day.key, e.target.value)}
                  rows={3}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary and reflections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Summary & Reflections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weekSummary">Week Summary</Label>
              <Textarea
                id="weekSummary"
                placeholder="Provide a comprehensive summary of your week's work..."
                value={formData.weekSummary}
                onChange={(e) => handleChange("weekSummary", e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challengesFaced">Challenges Faced</Label>
              <Textarea
                id="challengesFaced"
                placeholder="What challenges did you encounter and how did you address them?"
                value={formData.challengesFaced}
                onChange={(e) => handleChange("challengesFaced", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonsLearned">Lessons Learned</Label>
              <Textarea
                id="lessonsLearned"
                placeholder="What key lessons did you learn this week?"
                value={formData.lessonsLearned}
                onChange={(e) => handleChange("lessonsLearned", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillsAcquired">Skills Acquired</Label>
              <Textarea
                id="skillsAcquired"
                placeholder="List any new skills or competencies you developed..."
                value={formData.skillsAcquired}
                onChange={(e) => handleChange("skillsAcquired", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Entry
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitLogbook;
