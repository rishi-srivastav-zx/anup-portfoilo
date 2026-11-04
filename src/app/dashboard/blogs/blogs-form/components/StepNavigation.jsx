"use client";

import React from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import { FORM_STEPS } from "../config/blogFormConfig";
import {
  FileText,
  Image as ImageIcon,
  Type,
  Layers,
  Globe,
  Eye,
  Check,
} from "lucide-react";

const STEP_ICONS = {
  FileText,
  Image: ImageIcon,
  Type,
  Layers,
  Globe,
  Eye,
};

export default function StepNavigation() {
  const { currentStep, goToStep } = useBlogForm();

  return (
    <div className="py-4 px-4 sm:px-6 border-b border-[#14100E]/15 bg-[#F4EDE4]/60">
      {/* Horizontal Stepper */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3">
          {FORM_STEPS.map((step) => {
            const Icon = STEP_ICONS[step.iconName] || FileText;
            const isCompleted = step.stepNumber < currentStep;
            const isActive = step.stepNumber === currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => goToStep(step.stepNumber)}
                className={`relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-[#012CEB] bg-[#F4EFE6] shadow-[2px_2px_0_#012CEB] ring-1 ring-[#012CEB]"
                    : isCompleted
                    ? "border-[#14100E]/20 bg-[#F4EFE6]/80 hover:bg-[#F4EFE6] text-[#14100E]"
                    : "border-transparent bg-transparent hover:bg-black/5 text-[#6B625A]"
                }`}
              >
                {/* Step circle / icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#012CEB] text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-[#14100E]/10 text-[#6B625A]"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono-tech uppercase font-bold text-[#8C8278]">
                      0{step.stepNumber}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-sans font-semibold truncate ${
                      isActive ? "text-[#012CEB]" : "text-[#14100E]"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Linear progress bar */}
        <div className="mt-3 w-full bg-[#14100E]/10 h-1 rounded-full overflow-hidden">
          <div
            className="bg-[#012CEB] h-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (FORM_STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

