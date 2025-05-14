"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Button } from "./ui/button";

interface SignInProps {
  provider: string;
}

export default function SignIn({ provider }: SignInProps) {
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
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        aria-label={`Sign in with ${provider}`}
        className="w-full bg-black text-white py-2 px-4 flex items-center justify-center"
      >
        {icon}
        <span>
          Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </span>
      </Button>
    </form>
  );
}