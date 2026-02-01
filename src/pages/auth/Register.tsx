// Register.tsx (FIXED)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) {
      toast({
        title: "Role required",
        description: "Please select your role.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Map frontend role values to backend role values
      const roleMap: { [key: string]: string } = {
        'supervisor': 'institutionSupervisor',
        'industry_supervisor': 'industrySupervisor',
        'coordinator': 'siwesCoordinator',
        'hod': 'hod'
      };

      const backendRole = roleMap[formData.role] || formData.role;

      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        department: formData.department,
      }, backendRole);

      toast({
        title: "Registration successful",
        description: `Welcome as ${formData.role}! Redirecting to dashboard...`,
      });

      // Navigate to appropriate dashboard
      switch (backendRole) {
        case 'institutionSupervisor':
          navigate("/supervisor-dashboard");
          break;
        case 'industrySupervisor':
          navigate("/industry-dashboard");
          break;
        case 'siwesCoordinator':
          navigate("/coordinator-dashboard");
          break;
        case 'hod':
          navigate("/hod-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error: any) {
      // FIX: Extract error message properly
      const errorMessage = error?.message || error?.toString() || "Failed to create account. Please try again.";

      toast({
        title: "Registration failed",
        description: errorMessage, // Now passing string, not Error object
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
        <div className="w-12 h-12 bg-primary flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">InternTrack</span>
      </div>

      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-foreground">Create account</h2>
        <p className="mt-2 text-muted-foreground">
          Register as a supervisor, coordinator, or HOD
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@baze.edu.ng"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            className="h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervisor">Institution Supervisor</SelectItem>
                <SelectItem value="industry_supervisor">Industry Supervisor</SelectItem>
                <SelectItem value="coordinator">SIWES Coordinator</SelectItem>
                <SelectItem value="hod">Head of Department</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange("department", value)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select dept." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                <SelectItem value="Information Technology">Information Technology</SelectItem>
                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password (min. 6 chars)"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
              minLength={6}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            required
            className="h-11"
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            "Creating account..."
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;