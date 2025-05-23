"use client";

import React from "react";
import SignIn from "@/components/sign-in";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="p-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome! Sign in to get started.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New here? You&apos;ll be onboarded after login.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 justify-center">
            <SignIn provider="google" />
            <SignIn provider="github" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}