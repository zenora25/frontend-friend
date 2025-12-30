// Login.tsx (updated)
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, role !== 'student' ? role : undefined);
      
      toast({
        title: "Login successful",
        description: "Welcome back to InternTrack!",
      });

      // Navigate based on role
      switch (role) {
        case 'student':
          navigate("/dashboard");
          break;
        case 'institutionSupervisor':
          navigate("/supervisor-dashboard");
          break;
        case 'industrySupervisor':
          navigate("/industry-dashboard");
          break;
        case 'hod':
          navigate("/hod-dashboard");
          break;
        case 'siwesCoordinator':
          navigate("/coordinator-dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
        <div className="w-12 h-12 bg-primary flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold text-foreground">InternTrack</span>
      </div>

      <div className="text-center lg:text-left">
        <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
        <p className="mt-2 text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="role">Login as</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="institutionSupervisor">Institution Supervisor</SelectItem>
              <SelectItem value="industrySupervisor">Industry Supervisor</SelectItem>
              <SelectItem value="hod">Head of Department</SelectItem>
              <SelectItem value="siwesCoordinator">SIWES Coordinator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@baze.edu.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pr-10"
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

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? (
            "Signing in..."
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Register here
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          Are you a student?{" "}
          <Link to="/student-register" className="text-primary font-medium hover:underline">
            Student Registration
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;