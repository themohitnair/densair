"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SignInProps {
  provider: string;
  className?: string;
}

export default function SignIn({ provider, className }: SignInProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signIn(provider);
    } catch (error) {
      console.error("Sign in failed:", error);
      alert("Sign in failed. Please try again.");
    }
  };

  const icon =
    provider === "google" ? (
      <FaGoogle size={20} className="mr-2" />
    ) : provider === "github" ? (
      <FaGithub size={20} className="mr-2" />
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Button
        type="submit"
        variant="default"
        aria-label={`Sign in with ${provider}`}
        className={cn(
          "w-full flex items-center justify-center",
          provider === "github" && "border-gray-300 dark:border-gray-600",
          provider === "google" && "border-gray-300 dark:border-gray-600",
          className
        )}
      >
        {icon}
        <span>
          Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </span>
      </Button>
    </form>
  );
}