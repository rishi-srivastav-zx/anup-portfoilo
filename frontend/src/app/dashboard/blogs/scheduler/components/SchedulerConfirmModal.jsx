"use client";

import React from "react";
import { AlertTriangle, X, Check, Loader2 } from "lucide-react";

export default function SchedulerConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  confirmVariant = "primary", // primary (blue), danger (rose), warning (amber)
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    primary: "bg-[#012CEB] hover:bg-[#0022BD] text-white shadow-[2px_2px_0_#14100E]",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-[2px_2px_0_#14100E]",
    warning: "bg-amber-600 hover:bg-amber-700 text-white shadow-[2px_2px_0_#14100E]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl shadow-[6px_6px_0_#14100E] p-6 space-y-5">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-[#6B625A] hover:text-[#14100E] hover:bg-black/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl border border-[#14100E]/20 bg-[#E6DDD2] text-[#14100E]">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#14100E]">
              {title}
            </h3>
            <p className="text-xs text-[#6B625A] mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#14100E]/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-[#14100E]/20 text-[#6B625A] hover:text-[#14100E] text-xs font-mono font-medium hover:bg-black/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-all ${
              variantStyles[confirmVariant] || variantStyles.primary
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

