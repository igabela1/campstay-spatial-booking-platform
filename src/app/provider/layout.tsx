'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import { providerNavLinks } from "@/lib/nav-links";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 text-white">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (session?.user?.role !== "PROVIDER") {
    redirect("/");
  }

  const user = session?.user ?? {
    name: "Provider",
    email: "provider@example.com",
  };

  return (
    <DashboardLayout navLinks={providerNavLinks} user={user}>
      {children}
    </DashboardLayout>
  );
}