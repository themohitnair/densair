"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Save, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { ARXIV_DOMAIN_NAMES, convertAbbreviationsToNames, convertNamesToAbbreviations } from "@/constants/arxiv";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const arxivDomains = ARXIV_DOMAIN_NAMES;

interface UserProfile {
  name: string;
  email: string;
  image?: string;
  joinedDate: string;
  interests: string[];
  userType: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [userType, setUserType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Notice");
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (status === "loading") return;
      
      if (status === "unauthenticated") {
        router.push("/auth");
        return;
      }
      
      try {
        const res = await fetch("/api/preferences");
        
        if (res.ok) {
          const data = await res.json();
          setUserType(data.userType || "");
          
          let domainAbbreviations: string[] = [];
          
          if (typeof data.domains === "string") {
            domainAbbreviations = JSON.parse(data.domains);
          } else {
            domainAbbreviations = data.domains || [];
          }

          const domainNames = convertAbbreviationsToNames(domainAbbreviations);
          setDomains(domainNames);
          
          setUserProfile({
            name: session?.user?.name || "User",
            email: session?.user?.email || "user@example.com",
            image: session?.user?.image || "",
            joinedDate: "May 2025",
            interests: domainNames,
            userType: data.userType || ""
          });
        } else {
          showDialog("Error", "Failed to load your preferences");
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        showDialog("Error", "An error occurred while loading your preferences");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPreferences();
  }, [status, router, session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const toggleDomain = (domain: string) => {
    setDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!userType) {
      showDialog("Form Incomplete", "Please select your role");
      return false;
    }

    if (domains.length < 2) {
      showDialog("Form Incomplete", "Please select at least two areas of interest");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
  
    try {
      const domainAbbreviations = convertNamesToAbbreviations(domains);

      const res = await fetch("/api/preferences", {
        method: "PUT",
        body: JSON.stringify({ userType, domains: domainAbbreviations }),
        headers: { "Content-Type": "application/json" },
      });
    
      if (res.ok) {
        showDialog("Success", "Your preferences have been updated successfully!");
        // Update the userProfile state to reflect changes
        setUserProfile(prev => prev ? {
          ...prev,
          interests: domains,
          userType: userType
        } : null);
      } else {
        const errorData = await res.json();
        showDialog("Error", errorData.error || "Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      showDialog("Error", "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-foreground">Loading your settings...</p>
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
      <div className="bg-background border-none">
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
              <Button variant="destructive" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Section */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Your Role</h3>
                <div className="max-w-md">
                  <Label htmlFor="userType" className="block text-sm font-medium mb-2">
                    I am a
                  </Label>
                  <Select value={userType} onValueChange={(value) => setUserType(value)}>
                    <SelectTrigger id="userType" className="w-full">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Researcher">Researcher</SelectItem>
                      <SelectItem value="Educator">Educator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Domains Section */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">Research Interests</h3>
                <Label className="block text-sm font-medium mb-3">
                  I am interested in (select at least two)
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {arxivDomains.map((domain) => (
                    <div key={domain} className="flex items-center space-x-2">
                      <Checkbox
                        id={domain}
                        checked={domains.includes(domain)}
                        onCheckedChange={() => toggleDomain(domain)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={domain} className="cursor-pointer text-sm">
                        {domain}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for errors and success messages */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              setIsDialogOpen(false);
              // If it was a success message, you might want to redirect
              if (dialogTitle === "Success") {
                router.push("/feed");
              }
            }}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}