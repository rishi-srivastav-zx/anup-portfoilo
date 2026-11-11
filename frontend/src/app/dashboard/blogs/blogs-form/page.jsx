"use client";

import React, { Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { BlogFormProvider, useBlogForm } from "./context/BlogFormProvider";
import FormHeader from "./components/FormHeader";
import StepNavigation from "./components/StepNavigation";
import Step1BasicInfo from "./components/Step1BasicInfo";
import Step2Media from "./components/Step2Media";
import Step4Sections from "./components/Step4Sections";
import Step5SEO from "./components/Step5SEO";
import StepNavigationControls from "./components/StepNavigationControls";
import { Loader2 } from "lucide-react";

function BlogFormInner() {
  const { currentStep } = useBlogForm();

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] -m-4 sm:-m-6 lg:-m-8 bg-[#E6DDD2]">
      {/* Sticky top header with action buttons */}
      <FormHeader />

      {/* Stepper navigation bar */}
      <StepNavigation />

      {/* Active step content */}
      <div className="flex-1 px-4 sm:px-6 py-8">
        {currentStep === 1 && <Step1BasicInfo />}
        {currentStep === 2 && <Step2Media />}
        {currentStep === 3 && <Step4Sections />}
        {currentStep === 4 && <Step5SEO />}
      </div>

      {/* Bottom step navigation buttons */}
      <StepNavigationControls />
    </div>
  );
}

export default function BlogFormPage() {
  const { user, logout, refreshAccessToken } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#E6DDD2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#012CEB]" />
        </div>
      }
    >
      <BlogFormProvider>
        <DashboardLayout
          activeView="blog-create"
          user={user}
          onLogout={logout}
          onRefreshSession={refreshAccessToken}
        >
          <BlogFormInner />
        </DashboardLayout>
      </BlogFormProvider>
    </Suspense>
  );
}

