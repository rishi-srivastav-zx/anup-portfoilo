import React from "react";
import DashboardAuthGuard from "@/components/dashboard/DashboardAuthGuard";

export const metadata = {
    title: "Dashboard | Studio Workspace",
    description: "Administrative console and client portal",
};

/**
 * Server Component Layout for the Dashboard Route Group.
 * Wraps all protected pages in DashboardAuthGuard while remaining a Server Component.
 * Automatically reused by all nested dashboard routes without recreating providers.
 */
export default function DashboardRouteLayout({ children }) {
    return <DashboardAuthGuard>{children}</DashboardAuthGuard>;
}
