
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format time
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Truncate text
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return "U";
  return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
}

// Capitalize first letter
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Format role for display
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    student: "Student",
    institutionSupervisor: "Institution Supervisor",
    industrySupervisor: "Industry Supervisor",
    hod: "Head of Department",
    siwesCoordinator: "SIWES Coordinator",
    coordinator: "SIWES Coordinator",
  };
  return roleMap[role] || capitalize(role);
}

// Generate gradient colors based on role
export function getRoleGradient(role: string): string {
  const gradientMap: Record<string, string> = {
    student: "from-blue-500 to-cyan-500",
    institutionSupervisor: "from-green-500 to-emerald-500",
    industrySupervisor: "from-orange-500 to-amber-500",
    siwesCoordinator: "from-purple-500 to-pink-500",
    coordinator: "from-purple-500 to-pink-500",
    hod: "from-red-500 to-rose-500",
  };
  return gradientMap[role] || "from-gray-500 to-slate-500";
}