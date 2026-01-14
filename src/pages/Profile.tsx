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
    const { user } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        companyName: user?.companyName || "",
        companyAddress: user?.companyAddress || "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            const data = response.data.data;
            setFormData({
                fullName: data.fullName || "",
                email: data.email || "",
                phone: data.phone || "",
                companyName: data.companyName || "",
                companyAddress: data.companyAddress || "",
            });
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await authAPI.updateProfile(formData);
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

                        {user?.role === "student" && (
                            <>
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
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="w-32 h-32">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-2xl">
                                {user?.fullName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                            Change Photo
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Role: {user?.role}</p>
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