import { Link } from "react-router-dom";
import { BookOpen, Users, ClipboardCheck, Shield, Calendar, ArrowRight, Sparkles, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const features = [
    { icon: ClipboardCheck, title: "Digital Logbooks", description: "Submit and track weekly activities online with real-time status updates", accent: "from-gray-100 to-gray-50" },
    { icon: Users, title: "Multi-Role Access", description: "Dedicated dashboards for students, supervisors, coordinators, and HODs", accent: "from-gray-100 to-gray-50" },
    { icon: Shield, title: "Secure Verification", description: "Coordinator-generated codes ensure authentic student registration", accent: "from-gray-100 to-gray-50" },
    { icon: Calendar, title: "Defense Management", description: "Schedule and coordinate SIWES defense presentations seamlessly", accent: "from-gray-100 to-gray-50" },
  ];

  const stats = [
    { value: "500+", label: "Students Registered", icon: Users },
    { value: "50+", label: "Supervisors", icon: ClipboardCheck },
    { value: "95%", label: "Completion Rate", icon: Zap },
    { value: "24/7", label: "Access Available", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">InternTrack</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:flex text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90 transition-opacity">
              <Link to="/student-register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-to-b from-gray-50 to-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gray-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-gray-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Streamline your SIWES journey</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in">
              Your Complete{" "}
              <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                SIWES Hub
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              A comprehensive digital platform for managing Student Industrial Work Experience Scheme documentation, monitoring, and evaluation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button size="lg" asChild className="h-14 px-8 text-base bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90 transition-all hover:scale-105">
                <Link to="/student-register">
                  Student Registration
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base border-2 border-gray-300 hover:bg-gray-100 transition-all hover:scale-105 text-gray-700">
                <Link to="/login">Staff Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 relative bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
              >
                <stat.icon className="w-6 h-6 text-white/70 mx-auto mb-3" />
                <p className="text-3xl lg:text-5xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                SIWES Management
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to streamline your internship experience from start to finish
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-6 bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-gray-700" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative bg-gray-50">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center p-12 bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Join hundreds of students already using InternTrack to manage their SIWES experience.
            </p>
            <Button size="lg" asChild className="h-14 px-10 text-base bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:opacity-90 transition-all hover:scale-105">
              <Link to="/student-register">
                Register Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">InternTrack</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 InternTrack. Baze University SIWES Management System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;