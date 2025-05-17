"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Edit, LogOut, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  image?: string;
  joinedDate: string;
  interests: string[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Simulate loading user profile data
    if (status === "authenticated") {
      // Fetch user profile data here
      setTimeout(() => {
        setUserProfile({
          name: session?.user?.name || "User",
          email: session?.user?.email || "user@example.com",
          image: session?.user?.image || "",
          joinedDate: "May 2025",
          interests: ["Computer Science", "Mathematics", "Physics"],
        });
        setIsLoading(false);
      }, 1000);
    } else if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      window.location.href = "/login";
    }
  }, [status, session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={userProfile?.image} alt={userProfile?.name || "User"} />
              <AvatarFallback className="text-xl">
                {userProfile?.name ? getInitials(userProfile.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {userProfile?.name || "User"}
              </h1>
              <p className="text-muted-foreground">{userProfile?.email || "No email"}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {userProfile?.joinedDate || "N/A"}
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-8">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  This is your profile information. You can edit this in the
                  profile settings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userProfile?.interests?.map((interest: string) => (
                    <div
                      key={interest}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                    >
                      {interest}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your recent activity will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">
                    Account Preferences
                  </h3>
                  <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">
                    Notification Settings
                  </h3>
                  <p className="text-muted-foreground">
                    Configure how you receive notifications.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">
                    Privacy Settings
                  </h3>
                  <p className="text-muted-foreground">
                    Control your privacy and data settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
