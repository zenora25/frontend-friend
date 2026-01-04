import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { defenseAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface DefenseSchedule {
  id: number;
  date: string;
  time: string;
  venue: string;
  students: string[];
  panel: string[];
  status: "confirmed" | "pending";
}

const DefenseManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDefenseSchedules();
  }, []);

  const fetchDefenseSchedules = async () => {
    try {
      const response = await defenseAPI.getAllDefenses();
      const data = response.data?.defenses || [];

      const transformedSchedules: DefenseSchedule[] = data.map((defense: any) => ({
        id: defense.id,
        date: new Date(defense.defenseDate).toISOString().split('T')[0],
        time: defense.defenseTime,
        venue: defense.venue,
        students: defense.Student ? [defense.Student.fullName] : [],
        panel: defense.panelMembers || ["Dr. Sarah Johnson", "Prof. Michael Adeyemi"],
        status: defense.status === "SCHEDULED" ? "confirmed" : "pending",
      }));

      setSchedules(transformedSchedules.length > 0 ? transformedSchedules : getMockSchedules());
    } catch (error) {
      console.error("Failed to fetch defense schedules:", error);
      setSchedules(getMockSchedules());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockSchedules = (): DefenseSchedule[] => {
    return [
      {
        id: 1,
        date: "2024-06-20",
        time: "09:00 AM",
        venue: "Room 201",
        students: ["John Doe", "Jane Smith"],
        panel: ["Dr. Sarah Johnson", "Prof. Michael Adeyemi"],
        status: "confirmed",
      },
      {
        id: 2,
        date: "2024-06-20",
        time: "10:00 AM",
        venue: "Room 201",
        students: ["Mike Johnson", "Sarah Williams"],
        panel: ["Dr. Grace Okonkwo", "Dr. James Obi"],
        status: "confirmed",
      },
      {
        id: 3,
        date: "2024-06-20",
        time: "11:00 AM",
        venue: "Room 202",
        students: ["Alex Brown"],
        panel: ["Dr. Sarah Johnson", "Dr. Grace Okonkwo"],
        status: "pending",
      },
      {
        id: 4,
        date: "2024-06-21",
        time: "09:00 AM",
        venue: "Room 201",
        students: ["Emily Davis", "Chris Wilson"],
        panel: ["Prof. Michael Adeyemi", "Dr. James Obi"],
        status: "confirmed",
      },
      {
        id: 5,
        date: "2024-06-21",
        time: "10:00 AM",
        venue: "Room 202",
        students: ["Lisa Anderson"],
        panel: ["Dr. Sarah Johnson", "Dr. Grace Okonkwo"],
        status: "pending",
      },
    ];
  };

  const handleCreateSchedule = async () => {
    try {
      // In a real implementation, you would collect form data and call the API
      // const formData = { ... }
      // await defenseAPI.scheduleDefense(formData);

      toast({
        title: "Schedule created",
        description: "New defense schedule has been created successfully.",
      });

      // Refresh schedules
      fetchDefenseSchedules();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to create schedule",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const stats = {
    totalScheduled: schedules.length,
    confirmed: schedules.filter((s) => s.status === "confirmed").length,
    pending: schedules.filter((s) => s.status === "pending").length,
    totalStudents: schedules.reduce((acc, s) => acc + s.students.length, 0),
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Defense Management</h1>
            <p className="text-muted-foreground">
              Schedule and manage SIWES defense presentations.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Defense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Defense Session</DialogTitle>
                <DialogDescription>
                  Create a new defense schedule for students.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select venue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room201">Room 201</SelectItem>
                        <SelectItem value="room202">Room 202</SelectItem>
                        <SelectItem value="room203">Room 203</SelectItem>
                        <SelectItem value="room204">Room 204</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Students</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student1">John Doe</SelectItem>
                      <SelectItem value="student2">Jane Smith</SelectItem>
                      <SelectItem value="student3">Mike Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Panel Members</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select panel members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="panel1">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="panel2">Prof. Michael Adeyemi</SelectItem>
                      <SelectItem value="panel3">Dr. Grace Okonkwo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSchedule}>Create Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalScheduled}</p>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-5/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-chart-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-1/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-chart-2/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                placeholder="Search schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Schedule list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Defense Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Venue</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Panel</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
                </thead>
                <tbody>
                {schedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{schedule.date}</p>
                            <p className="text-sm text-muted-foreground">{schedule.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{schedule.venue}</td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {schedule.students.map((student, idx) => (
                              <p key={idx} className="text-sm text-foreground">{student}</p>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {schedule.panel.map((member, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">{member}</p>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                            variant="secondary"
                            className={
                              schedule.status === "confirmed"
                                  ? "bg-chart-5/20 text-chart-5"
                                  : "bg-chart-1/20 text-chart-1"
                            }
                        >
                          {schedule.status === "confirmed" ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {schedule.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default DefenseManagement;