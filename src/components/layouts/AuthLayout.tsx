import { Outlet } from "react-router-dom";
import { BookOpen, Users, ClipboardCheck, Shield } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary-foreground/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary-foreground">InternTrack</span>
          </div>
          
          <h1 className="text-4xl font-bold text-primary-foreground mb-6">
            Streamline Your SIWES Experience
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-12">
            A comprehensive digital platform for managing Student Industrial Work Experience Scheme documentation, monitoring, and evaluation.
          </p>

          <div className="space-y-6">
            <FeatureItem 
              icon={<ClipboardCheck className="w-5 h-5" />}
              title="Digital Logbooks"
              description="Submit and track weekly activities online"
            />
            <FeatureItem 
              icon={<Users className="w-5 h-5" />}
              title="Multi-Role Access"
              description="Dashboards for students, supervisors, and coordinators"
            />
            <FeatureItem 
              icon={<Shield className="w-5 h-5" />}
              title="Secure Verification"
              description="Coordinator-generated codes for authentic registration"
            />
          </div>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © 2024 InternTrack. Baze University SIWES Management System.
        </p>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 text-primary-foreground">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-primary-foreground">{title}</h3>
      <p className="text-sm text-primary-foreground/70">{description}</p>
    </div>
  </div>
);

export default AuthLayout;
