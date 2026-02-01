import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  File,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface LogbookFormData {
  weekNumber: string;
  startDate: string;
  endDate: string;
  title: string;
  mondayActivities: string;
  tuesdayActivities: string;
  wednesdayActivities: string;
  thursdayActivities: string;
  fridayActivities: string;
  weekSummary: string;
  challengesFaced: string;
  lessonsLearned: string;
  skillsAcquired: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: string;
  type: string;
}

const SubmitLogbook = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<LogbookFormData>({
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

  const handleChange = (field: keyof LogbookFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];

    Array.from(files).forEach(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive",
        });
        return;
      }

      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';

      newFiles.push({
        file,
        preview,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type.startsWith('image/') ? 'image' : 'document'
      });
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewFile = (file: UploadedFile) => {
    if (file.preview) {
      window.open(file.preview, '_blank');
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);

      // Create FormData for draft saving (similar to submit but with status DRAFT)
      const formDataToSend = new FormData();
      formDataToSend.append('weekNumber', formData.weekNumber || '0');
      formDataToSend.append('startDate', formData.startDate || new Date().toISOString().split('T')[0]);
      formDataToSend.append('endDate', formData.endDate || new Date().toISOString().split('T')[0]);
      formDataToSend.append('title', formData.title || 'Untitled Draft');
      formDataToSend.append('weekSummary', formData.weekSummary || 'Draft summary');
      formDataToSend.append('status', 'DRAFT');

      // Append optional fields
      if (formData.mondayActivities) formDataToSend.append('mondayActivities', formData.mondayActivities);
      if (formData.tuesdayActivities) formDataToSend.append('tuesdayActivities', formData.tuesdayActivities);
      if (formData.wednesdayActivities) formDataToSend.append('wednesdayActivities', formData.wednesdayActivities);
      if (formData.thursdayActivities) formDataToSend.append('thursdayActivities', formData.thursdayActivities);
      if (formData.fridayActivities) formDataToSend.append('fridayActivities', formData.fridayActivities);
      if (formData.challengesFaced) formDataToSend.append('challengesFaced', formData.challengesFaced);
      if (formData.lessonsLearned) formDataToSend.append('lessonsLearned', formData.lessonsLearned);
      if (formData.skillsAcquired) formDataToSend.append('skillsAcquired', formData.skillsAcquired);

      // Append files
      uploadedFiles.forEach(file => {
        if (file.file) {
          formDataToSend.append('images', file.file);
        }
      });

      await api.post('/logbook', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Draft saved",
        description: "Your logbook entry has been saved to the database as a draft.",
      });

      localStorage.removeItem('logbook_draft');
    } catch (error: any) {
      console.error("Draft save error:", error);
      toast({
        title: "Failed to save draft",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.weekNumber || !formData.startDate || !formData.endDate || !formData.title || !formData.weekSummary) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('weekNumber', formData.weekNumber);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('weekSummary', formData.weekSummary);

      // Append optional fields if they exist
      if (formData.mondayActivities) formDataToSend.append('mondayActivities', formData.mondayActivities);
      if (formData.tuesdayActivities) formDataToSend.append('tuesdayActivities', formData.tuesdayActivities);
      if (formData.wednesdayActivities) formDataToSend.append('wednesdayActivities', formData.wednesdayActivities);
      if (formData.thursdayActivities) formDataToSend.append('thursdayActivities', formData.thursdayActivities);
      if (formData.fridayActivities) formDataToSend.append('fridayActivities', formData.fridayActivities);
      if (formData.challengesFaced) formDataToSend.append('challengesFaced', formData.challengesFaced);
      if (formData.lessonsLearned) formDataToSend.append('lessonsLearned', formData.lessonsLearned);
      if (formData.skillsAcquired) formDataToSend.append('skillsAcquired', formData.skillsAcquired);

      // Append files
      uploadedFiles.forEach(file => {
        formDataToSend.append('images', file.file);
      });

      // Submit with files using the regular create endpoint
      await api.post('/logbook', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: "Logbook submitted",
        description: "Your weekly logbook entry has been submitted for review.",
      });

      // Clean up preview URLs
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      localStorage.removeItem('logbook_draft');
      navigate("/dashboard/logbook");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission failed",
        description: error.response?.data?.error || "Failed to submit logbook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = [
    { key: "mondayActivities" as const, label: "Monday" },
    { key: "tuesdayActivities" as const, label: "Tuesday" },
    { key: "wednesdayActivities" as const, label: "Wednesday" },
    { key: "thursdayActivities" as const, label: "Thursday" },
    { key: "fridayActivities" as const, label: "Friday" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit Logbook Entry</h1>
          <p className="text-gray-600">
            Document your weekly activities and learning experiences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Week details */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <Calendar className="w-5 h-5" />
              Week Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekNumber" className="text-gray-900">Week Number *</Label>
                <Input
                  id="weekNumber"
                  type="number"
                  placeholder="e.g., 8"
                  value={formData.weekNumber}
                  onChange={(e) => handleChange("weekNumber", e.target.value)}
                  required
                  min="1"
                  max="52"
                  className="border-gray-300 focus:border-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-gray-900">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  required
                  className="border-gray-300 focus:border-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-gray-900">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  required
                  className="border-gray-300 focus:border-gray-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-900">Week Title/Theme *</Label>
              <Input
                id="title"
                placeholder="e.g., API Development & Testing"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                className="border-gray-300 focus:border-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Section */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <ImageIcon className="w-5 h-5" />
              Supporting Documents & Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700 mb-1">Upload supporting files (optional)</p>
                  <p className="text-xs text-gray-500">Upload images, documents, or screenshots that support your weekly activities</p>
                </div>
              </div>

              {/* File upload area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 font-medium">Click to upload files</p>
                <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG, GIF, PDF, DOC up to 10MB each</p>
              </div>

              {/* Uploaded files preview */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                              {file.type === 'image' ? (
                                <ImageIcon className="w-5 h-5 text-gray-600" />
                              ) : (
                                <File className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {file.preview && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                onClick={() => handleViewFile(file)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {file.preview && (
                          <div className="mt-3">
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily activities */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <Clock className="w-5 h-5" />
              Daily Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {days.map((day) => (
              <div key={day.key} className="space-y-2">
                <Label htmlFor={day.key} className="text-gray-900">{day.label}</Label>
                <Textarea
                  id={day.key}
                  placeholder={`Describe your activities for ${day.label}...`}
                  value={formData[day.key]}
                  onChange={(e) => handleChange(day.key, e.target.value)}
                  rows={3}
                  className="border-gray-300 focus:border-gray-400"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary and reflections */}
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
              <FileText className="w-5 h-5" />
              Summary & Reflections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="weekSummary" className="text-gray-900">Week Summary *</Label>
              <Textarea
                id="weekSummary"
                placeholder="Provide a comprehensive summary of your week's work..."
                value={formData.weekSummary}
                onChange={(e) => handleChange("weekSummary", e.target.value)}
                rows={4}
                required
                className="border-gray-300 focus:border-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challengesFaced" className="text-gray-900">Challenges Faced</Label>
              <Textarea
                id="challengesFaced"
                placeholder="What challenges did you encounter and how did you address them?"
                value={formData.challengesFaced}
                onChange={(e) => handleChange("challengesFaced", e.target.value)}
                rows={3}
                className="border-gray-300 focus:border-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessonsLearned" className="text-gray-900">Lessons Learned</Label>
              <Textarea
                id="lessonsLearned"
                placeholder="What key lessons did you learn this week?"
                value={formData.lessonsLearned}
                onChange={(e) => handleChange("lessonsLearned", e.target.value)}
                rows={3}
                className="border-gray-300 focus:border-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillsAcquired" className="text-gray-900">Skills Acquired</Label>
              <Textarea
                id="skillsAcquired"
                placeholder="List any new skills or competencies you developed..."
                value={formData.skillsAcquired}
                onChange={(e) => handleChange("skillsAcquired", e.target.value)}
                rows={3}
                className="border-gray-300 focus:border-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
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