"use client";

import React from "react";
import { useBlogForm } from "../context/BlogFormProvider";
import { FORM_STEPS } from "../config/blogFormConfig";
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";

export default function StepNavigationControls() {
  const { currentStep, prevStep, nextStep, saveArticle, isSaving } = useBlogForm();
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FORM_STEPS.length;

  return (
    <div className="py-6 border-t border-[#14100E]/15 bg-[#E6DDD2] sticky bottom-0 z-20">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-3">
        {/* Previous */}
        <button
          type="button"
          disabled={isFirstStep}
          onClick={prevStep}
          className="px-4 py-2.5 border-2 border-[#14100E] bg-[#F4EFE6] hover:bg-[#14100E] text-[#14100E] hover:text-[#F4EDE4] text-xs font-mono-tech font-bold rounded-xl shadow-[2px_2px_0_#14100E] transition-all disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        {/* Center Save */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() => saveArticle("published")}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono-tech text-[#6B625A] hover:text-[#14100E] hover:underline"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>

        {/* Next or Publish */}
        {isLastStep ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => saveArticle("published")}
            className="px-6 py-2.5 bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono-tech font-bold rounded-xl shadow-[3px_3px_0_#14100E] transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Publish Article Live</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2.5 border-2 border-[#14100E] bg-[#14100E] hover:bg-[#012CEB] hover:border-[#012CEB] text-[#F4EDE4] text-xs font-mono-tech font-bold rounded-xl shadow-[2px_2px_0_#14100E] transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed to Step 0{currentStep + 1}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

