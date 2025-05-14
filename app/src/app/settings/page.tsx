"use client";

import React, { useState, useEffect } from "react";

import { ARXIV_DOMAIN_NAMES, convertAbbreviationsToNames, convertNamesToAbbreviations } from "@/constants/arxiv";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const arxivDomains = ARXIV_DOMAIN_NAMES

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [domains, setDomains] = useState<string[]>([]);
  const [userType, setUserType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Notice");
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user initials for the avatar fallback
  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
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

          let domainAbbreviations: string[] = []
          
          if (typeof data.domains === "string") {
            domainAbbreviations = JSON.parse(data.domains)
          } else {
            domainAbbreviations = data.domains || []
          }

          const domainNames = convertAbbreviationsToNames(domainAbbreviations)
          setDomains(domainNames)
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
  }, [status, router]);
  
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

    if (domains.length === 0) {
      showDialog("Form Incomplete", "Please select at least one area of interest");
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
      const domainAbbreviations = convertNamesToAbbreviations(domains)

      const res = await fetch("/api/preferences", {
        method: "PUT",
        body: JSON.stringify({ userType, domains: domainAbbreviations }),
        headers: { "Content-Type": "application/json" },
      });
    
      if (res.ok) {
        showDialog("Success", "Your preferences have been updated successfully!");
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-lg">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="mt-4 md:mt-0 text-center md:text-left">
              <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
              <p className="text-gray-500">{session?.user?.email}</p>
              <p className="mt-1 text-sm text-gray-500">
                {userType ? `${userType}` : "Complete your profile below"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Profile Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update your preferences to customize the research papers we show you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* User Type Section */}
              <div>
                <h3 className="text-md font-medium mb-4">Your Role</h3>
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
                <h3 className="text-md font-medium mb-4">Research Interests</h3>
                <Label className="block text-sm font-medium mb-3">
                  I am interested in
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {arxivDomains.map((domain) => (
                    <div key={domain} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={domain}
                        value={domain}
                        checked={domains.includes(domain)}
                        onChange={() => toggleDomain(domain)}
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
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </div>
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