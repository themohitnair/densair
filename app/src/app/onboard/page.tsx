"use client";

import React, { useState } from "react";
import { ARXIV_DOMAIN_NAMES, convertNamesToAbbreviations } from "@/constants/arxiv";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const arxivDomains = ARXIV_DOMAIN_NAMES

export default function ArxivForm() {
  const [domains, setDomains] = useState<string[]>([]);
  const [userType, setUserType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toggleDomain = (domain: string) => {
    setDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain]
    );
  };

  const validateForm = () => {
    if (!userType) {
      setErrorMessage("Please select your role.");
      setIsDialogOpen(true);
      return false;
    }

    if (domains.length < 2) {
      setErrorMessage("Please select at least two areas of interest.");
      setIsDialogOpen(true);
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
        method: "POST",
        body: JSON.stringify({ userType, domains: domainAbbreviations }),
        headers: { "Content-Type": "application/json" },
      });
    
      if (res.ok) {
        window.location.href = "/feed";
      } else {
        setErrorMessage("Failed to save preferences. Please try again.");
        setIsDialogOpen(true);
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.");
      setIsDialogOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Just to let us get to know you
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We use this information to curate a feed of Research Papers for you.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection using Select */}
            <div className="space-y-2">
              <Label htmlFor="userType" className="block text-sm font-medium text-foreground">
                I am a
              </Label>
              <Select onValueChange={(value) => setUserType(value)}>
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
            {/* arXiv Domain Multi-Select */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-foreground">
                I am interested in
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {arxivDomains.map((domain) => (
                  <div key={domain} className="flex items-center space-x-2">
                    <Checkbox
                      id={domain}
                      checked={domains.includes(domain)}
                      onCheckedChange={() => toggleDomain(domain)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={domain} className="cursor-pointer text-sm text-foreground">
                      {domain}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Form Incomplete</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}