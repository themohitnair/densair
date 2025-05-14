"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return (
    <Button onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </Button>
  );
}