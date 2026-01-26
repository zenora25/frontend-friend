import { useState, useEffect } from "react";
import { User, Mail, Phone, Building, MapPin, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Help construction of image URL
    const getImageUrl = (path: string | undefined) => {
        if (!path) return "";
        if (path.startsWith('http')) return path;
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
        return `${baseUrl}${path}`;
    };

    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        department: user?.department || "",
        companyName: user?.companyName || "",
        companyAddress: user?.companyAddress || "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                department: user.department || "",
                companyName: user.companyName || "",
                companyAddress: user.companyAddress || "",
            });
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            await refreshUser();
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await authAPI.updateProfile(formData);
            await refreshUser();
            toast({
                title: "Profile updated",
                description: "Your profile information has been successfully updated.",
            });
            setIsEditing(false);
        } catch (error: any) {
            toast({
                title: "Update failed",
                description: error.response?.data?.error || "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fd = new FormData();
        fd.append('profileImage', file);

        setIsLoading(true);
        try {
            await authAPI.updateProfile(fd);
            await refreshUser();
            toast({
                title: "Photo updated",
                description: "Your profile picture has been updated successfully.",
            });
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.response?.data?.error || "Failed to upload image.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Personal Information</span>
                            {!isEditing ? (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </Label>
                                {isEditing ? (
                                    <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                                ) : (
                                    <p>{user?.fullName}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </Label>
                                <p className="text-muted-foreground">{user?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </Label>
                            {isEditing ? (
                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            ) : (
                                <p>{formData.phone || "Not provided"}</p>
                            )}
                        </div>

                        {user?.role !== "student" && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    Department
                                </Label>
                                {isEditing ? (
                                    <Input value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                                ) : (
                                    <p>{formData.department || "Not assigned"}</p>
                                )}
                            </div>
                        )}

                        {user?.role === "student" && (
                            <>
                                <div className="space-y-1 mt-2">
                                    <Label className="text-xs text-muted-foreground">Department</Label>
                                    <p className="font-medium">{user.department}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Company/Organization
                                    </Label>
                                    {isEditing ? (
                                        <Input value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                                    ) : (
                                        <p>{formData.companyName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Company Address
                                    </Label>
                                    {isEditing ? (
                                        <Input value={formData.companyAddress} onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })} />
                                    ) : (
                                        <p>{formData.companyAddress}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex flex-col items-center space-y-4 pt-6">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 border-2 border-primary/10">
                                <AvatarImage
                                    src={getImageUrl(user?.profileImage)}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-4xl bg-primary/5 text-primary">
                                    {user?.fullName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <input
                                type="file"
                                id="profile-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('profile-upload')?.click()}
                                disabled={isLoading}
                            >
                                <User className="w-4 h-4 mr-2" />
                                Change Photo
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground pt-4 border-t w-full">
                            <p className="font-medium text-foreground">Role: {user?.role}</p>
                            {user?.department && <p>Department: {user.department}</p>}
                            {user?.matricNumber && <p>Matric: {user.matricNumber}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;