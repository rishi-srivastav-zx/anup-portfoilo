"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  RotateCw,
  Loader2,
  Trash2,
  Info,
  Calendar,
} from "lucide-react";
import BlogServices from "@/api/services/blog.services";

export default function SchedulerBulkImport({ onImportComplete }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(360);
  const [allowPartial, setAllowPartial] = useState(true);

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [previewData, setPreviewData] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelection(dropped);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelection(selected);
  };

  const handleFileSelection = (selectedFile) => {
    setErrorMessage(null);
    setPreviewData(null);
    setImportSummary(null);

    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".json") && !name.endsWith(".csv")) {
      setErrorMessage("Unsupported file format. Please upload a .json or .csv bulk file.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setErrorMessage("File exceeds maximum allowed size of 15MB.");
      return;
    }

    setFile(selectedFile);
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewData(null);
    setImportSummary(null);
    setErrorMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 1. Run Preview API
  const handleGeneratePreview = async () => {
    if (!file) return;

    setIsLoadingPreview(true);
    setErrorMessage(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await BlogServices.previewImport(formData, {
        allowPartial: allowPartial ? "true" : "false",
      }, (evt) => {
        if (evt.total) {
          setUploadProgress(Math.round((evt.loaded * 90) / evt.total));
        }
      });

      setUploadProgress(100);
      setPreviewData(res.data || res);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to parse and preview bulk file.";
      setErrorMessage(msg);
      if (err.response?.data?.data) {
        setPreviewData(err.response.data.data);
      }
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // 2. Execute Real Import API
  const handleExecuteImport = async () => {
    if (!file) return;

    setIsExecutingImport(true);
    setErrorMessage(null);
    setUploadProgress(10);

    // Generate unique idempotency key
    const idempotencyKey = `import_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("allowPartial", allowPartial ? "true" : "false");
      formData.append("intervalMinutes", String(intervalMinutes || 360));

      const res = await BlogServices.executeImport(formData, idempotencyKey, (evt) => {
        if (evt.total) {
          setUploadProgress(Math.round((evt.loaded * 90) / evt.total));
        }
      });

      setUploadProgress(100);
      setImportSummary(res.data || res);

      if (onImportComplete) {
        onImportComplete(res.data || res);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Bulk import execution failed.";
      setErrorMessage(msg);
    } finally {
      setIsExecutingImport(false);
    }
  };

  const isJson = file?.name?.toLowerCase().endsWith(".json");

  return (
    <div className="bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl p-5 sm:p-7 shadow-[4px_4px_0_#14100E] space-y-6">
      {/* Title & Guidelines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#14100E]/15 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B625A]">
              SECTION 2 // BULK INGESTION PIPELINE
            </span>
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#14100E]">
            Bulk Blog Ingestion &amp; Automated Queue Staging
          </h2>
          <p className="text-xs text-[#6B625A] mt-0.5">
            Upload RFC-4180 CSV or JSON articles. All blogs are validated, sanitized, staged in draft status, and scheduled at {intervalMinutes}-minute intervals.
          </p>
        </div>

        {file && (
          <button
            type="button"
            onClick={resetUpload}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-[#14100E]/20 text-[#6B625A] hover:text-rose-600 hover:border-rose-600 text-xs font-mono font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Batch</span>
          </button>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-600/30 bg-rose-500/10 text-rose-800 text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Import Warning / Error:</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Upload Dropzone */}
      {!file && !importSummary && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#012CEB] bg-[#012CEB]/5 scale-[0.99]"
              : "border-[#14100E]/30 bg-[#E6DDD2]/40 hover:bg-[#E6DDD2]/80 hover:border-[#14100E]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-2xl border-2 border-[#14100E] bg-[#F4EFE6] text-[#012CEB] shadow-[2px_2px_0_#14100E]">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="font-editorial text-lg font-bold text-[#14100E]">
                Drop your JSON or CSV bulk file here
              </p>
              <p className="text-xs text-[#6B625A] mt-1 font-mono">
                Supports up to 100 articles per batch (max 15MB). Columns: title, slug, excerpt, category, content, sections...
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] text-[11px] font-mono text-[#14100E] inline-flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[#012CEB]" /> JSON Arrays
              </span>
              <span className="px-3 py-1 rounded-lg border border-[#14100E]/20 bg-[#F4EFE6] text-[11px] font-mono text-[#14100E] inline-flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> RFC-4180 CSV
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Details & Staging Controls */}
      {file && !importSummary && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-[#14100E]/20 bg-[#E6DDD2]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl border border-[#14100E] bg-[#F4EFE6] text-[#14100E]">
                {isJson ? (
                  <FileCode className="w-6 h-6 text-[#012CEB]" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                )}
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-[#14100E]">
                  {file.name}
                </div>
                <div className="text-[11px] font-mono text-[#6B625A]">
                  {(file.size / 1024).toFixed(1)} KB · Ready for validation
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowPartial}
                  onChange={(e) => setAllowPartial(e.target.checked)}
                  className="rounded border-[#14100E] text-[#012CEB] focus:ring-0"
                />
                <span className="text-[#14100E]">Allow Partial Import</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-[#6B625A]">Spacing:</span>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(Number(e.target.value) || 360)}
                  className="w-20 px-2 py-1 rounded-lg border border-[#14100E]/30 bg-[#F4EFE6] text-xs font-mono font-bold text-[#14100E] text-center"
                />
                <span className="text-[#6B625A]">min</span>
              </div>
            </div>
          </div>

          {/* Action to trigger Preview */}
          {!previewData && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={isLoadingPreview}
                className="px-5 py-2.5 rounded-xl bg-[#012CEB] hover:bg-[#0022BD] text-white text-xs font-mono font-bold inline-flex items-center gap-2 transition-all shadow-[2px_2px_0_#14100E]"
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing &amp; Validating ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Preview &amp; Validate Batch</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview Inspection Results */}
      {previewData && !importSummary && (
        <div className="space-y-5 animate-fadeIn">
          {/* Summary Badge Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border-2 border-[#14100E] bg-[#E6DDD2] text-center">
              <span className="text-[10px] font-mono uppercase text-[#6B625A] block">TOTAL ROWS</span>
              <span className="font-editorial text-2xl font-bold text-[#14100E]">
                {previewData.totalRecords || previewData.records?.length || 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border-2 border-[#14100E] bg-emerald-500/10 text-center">
              <span className="text-[10px] font-mono uppercase text-emerald-800 block">VALID TO IMPORT</span>
              <span className="font-editorial text-2xl font-bold text-emerald-700">
                {previewData.validRecordsCount || previewData.validRecords || 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border-2 border-[#14100E] bg-rose-500/10 text-center">
              <span className="text-[10px] font-mono uppercase text-rose-800 block">INVALID ROWS</span>
              <span className="font-editorial text-2xl font-bold text-rose-700">
                {previewData.invalidRecordsCount || previewData.invalidRecords || (previewData.errors?.length || 0)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border-2 border-[#14100E] bg-amber-500/10 text-center">
              <span className="text-[10px] font-mono uppercase text-amber-800 block">DUPLICATES</span>
              <span className="font-editorial text-2xl font-bold text-amber-700">
                {previewData.duplicateSlugsCount || (previewData.duplicateSlugs?.length || 0)}
              </span>
            </div>
          </div>

          {/* Validation Warnings / Errors Accordion */}
          {Array.isArray(previewData.errors) && previewData.errors.length > 0 && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4" />
                <span>Validation Errors Detected in Batch ({previewData.errors.length}):</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                {previewData.errors.map((err, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-white/80 border border-rose-200 text-[11px] font-mono text-rose-800 flex items-start justify-between gap-2"
                  >
                    <span>
                      Row #{err.row || err.index || idx + 1}: <strong>{err.title || err.slug || "Item"}</strong> — {err.message || JSON.stringify(err.errors || err)}
                    </span>
                    <span className="text-rose-600 font-bold uppercase text-[9px] shrink-0">REJECTED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Preview Rows List */}
          {Array.isArray(previewData.preview) && previewData.preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#14100E]">
                <span>Validated Samples Preview (Showing first {previewData.preview.length}):</span>
                <span className="text-[#6B625A]">Spacing: {intervalMinutes} minutes between slots</span>
              </div>

              <div className="border border-[#14100E]/15 rounded-xl overflow-hidden bg-white/70">
                <div className="divide-y divide-[#14100E]/10">
                  {previewData.preview.slice(0, 5).map((row, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-bold text-[#14100E] truncate">{row.title}</div>
                        <div className="text-[11px] font-mono text-[#6B625A] truncate">
                          /{row.slug} · Category: {row.category}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 text-[10px] font-mono font-bold uppercase shrink-0">
                        VALID
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Execution Button */}
          <div className="flex items-center justify-between pt-3 border-t border-[#14100E]/15">
            <button
              type="button"
              onClick={resetUpload}
              disabled={isExecutingImport}
              className="text-xs font-mono text-[#6B625A] hover:text-[#14100E]"
            >
              Choose different file
            </button>

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={
                isExecutingImport ||
                (previewData.validRecordsCount === 0 && !previewData.validRecords)
              }
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold inline-flex items-center gap-2 transition-all shadow-[3px_3px_0_#14100E]"
            >
              {isExecutingImport ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Staging Blogs &amp; Enqueueing ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Confirm &amp; Enqueue{" "}
                    {previewData.validRecordsCount || previewData.validRecords || 0} Articles
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Completed Import Summary Screen */}
      {importSummary && (
        <div className="p-6 rounded-2xl border-2 border-[#14100E] bg-emerald-500/10 space-y-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-[2px_2px_0_#14100E]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#14100E]">
                Bulk Staging Completed Successfully!
              </h3>
              <p className="text-xs font-mono text-[#6B625A]">
                {importSummary.importedCount || importSummary.successfulCount || 0} blogs saved as drafts and added to the automated publishing queue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono pt-2">
            <div className="p-3 rounded-xl bg-white/80 border border-[#14100E]/10">
              <span className="text-[#6B625A] block">ENQUEUED ARTICLES</span>
              <span className="font-bold text-emerald-800 text-lg">
                {importSummary.importedCount || importSummary.successfulCount || 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/80 border border-[#14100E]/10">
              <span className="text-[#6B625A] block">PUBLISHING INTERVAL</span>
              <span className="font-bold text-[#14100E] text-lg">
                {intervalMinutes} minutes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/80 border border-[#14100E]/10">
              <span className="text-[#6B625A] block">TIMEZONE</span>
              <span className="font-bold text-[#14100E] text-lg">
                Asia/Kolkata
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={resetUpload}
              className="px-5 py-2.5 rounded-xl bg-[#14100E] text-[#F4EDE4] text-xs font-mono font-bold hover:bg-[#012CEB] transition-colors shadow-[2px_2px_0_#14100E]"
            >
              Upload Another Batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

