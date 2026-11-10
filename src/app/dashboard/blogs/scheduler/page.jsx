"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarClock,
  Layers,
  UploadCloud,
  Settings,
  History,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

import SchedulerHeader from "./components/SchedulerHeader";
import SchedulerOverview from "./components/SchedulerOverview";
import SchedulerBulkImport from "./components/SchedulerBulkImport";
import SchedulerQueueTable from "./components/SchedulerQueueTable";
import SchedulerSettingsCard from "./components/SchedulerSettingsCard";
import SchedulerHistoryTable from "./components/SchedulerHistoryTable";

import BlogServices from "@/api/services/blog.services";

const broadcastBlogChange = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("blog_published_at", String(Date.now()));
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("studio_articles_updated"));
  }
};

export default function BlogSchedulerDashboardPage() {
  const { user, logout, refreshAccessToken } = useAuth();

  // Active Section Tab: "queue" | "import" | "settings" | "history"
  const [activeTab, setActiveTab] = useState("queue");

  // Global State
  const [stats, setStats] = useState(null);
  const [workerHealth, setWorkerHealth] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'info', text: string }

  // Queue Table State
  const [queueItems, setQueueItems] = useState([]);
  const [queuePagination, setQueuePagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [queueStatus, setQueueStatus] = useState("all");
  const [queueSearch, setQueueSearch] = useState("");
  const [isQueueLoading, setIsQueueLoading] = useState(false);

  // History Table State
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [historyStatus, setHistoryStatus] = useState("all");
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Settings Actions State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);

  const showToast = useCallback((text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // 1. Fetch Stats, Worker Health & Settings
  const loadMetadata = useCallback(async () => {
    try {
      const [statsRes, healthRes, settingsRes] = await Promise.all([
        BlogServices.getQueueStats(),
        BlogServices.getWorkerHealth(),
        BlogServices.getSchedulerSettings(),
      ]);

      setStats(statsRes.data || statsRes);
      setWorkerHealth(healthRes.data || healthRes);
      setSettings(settingsRes.data || settingsRes);
    } catch (err) {
      console.error("[Scheduler] Failed to load metadata:", err);
    }
  }, []);

  // 2. Fetch Paginated Queue Items
  const loadQueue = useCallback(async (page = 1, status = queueStatus, search = queueSearch) => {
    setIsQueueLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        status: status !== "all" ? status : undefined,
        search: search.trim() ? search.trim() : undefined,
      };

      const res = await BlogServices.getQueue(params);
      const data = res.data || res;
      setQueueItems(data.items || []);
      setQueuePagination({
        page: data.page || page,
        limit: data.limit || 20,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev,
      });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load publishing queue", "error");
    } finally {
      setIsQueueLoading(false);
    }
  }, [queueStatus, queueSearch, showToast]);

  // 3. Fetch Paginated Audit Logs
  const loadHistory = useCallback(async (page = 1, status = historyStatus) => {
    setIsHistoryLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        status: status !== "all" ? status : undefined,
      };

      const res = await BlogServices.getPublishLogs(params);
      const data = res.data || res;
      setHistoryLogs(data.items || []);
      setHistoryPagination({
        page: data.page || page,
        limit: data.limit || 20,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
        hasNext: data.hasNext,
        hasPrev: data.hasPrev,
      });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load execution logs", "error");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [historyStatus, showToast]);

  // Master refresh
  const handleRefreshAll = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadMetadata(),
        loadQueue(queuePagination.page),
        loadHistory(historyPagination.page),
      ]);
      showToast("Scheduler data and queue synchronised.", "info");
    } finally {
      setIsRefreshing(false);
    }
  }, [loadMetadata, loadQueue, loadHistory, queuePagination.page, historyPagination.page, showToast]);

  // Initial load
  useEffect(() => {
    loadMetadata();
    loadQueue(1);
    loadHistory(1);
  }, []);

  // Debounced search trigger for queue
  useEffect(() => {
    const timer = setTimeout(() => {
      loadQueue(1, queueStatus, queueSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [queueSearch, queueStatus]);

  // Action: Manual Publish
  const handleManualPublish = async (queueId) => {
    try {
      const res = await BlogServices.manualPublishQueueItem(queueId);
      showToast(res.message || "Article published live successfully!", "success");
      broadcastBlogChange();
      await handleRefreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to publish article", "error");
      throw err;
    }
  };

  // Action: Cancel Queue Item
  const handleCancelItem = async (queueId) => {
    try {
      const res = await BlogServices.cancelQueueItem(queueId);
      showToast(res.message || "Scheduled publication cancelled.", "info");
      await handleRefreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to cancel queue slot", "error");
      throw err;
    }
  };

  // Action: Retry Queue Item
  const handleRetryItem = async (queueId) => {
    try {
      const res = await BlogServices.retryQueueItem(queueId);
      showToast(res.message || "Job reset to pending for retry.", "success");
      await handleRefreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to retry job", "error");
      throw err;
    }
  };

  // Action: Reorder Queue
  const handleReorderItem = async (queueId, direction) => {
    const currentIndex = queueItems.findIndex((q) => q.id === queueId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= queueItems.length) return;

    // Optimistically reorder in state
    const newItems = [...queueItems];
    const [moved] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, moved);
    setQueueItems(newItems);

    try {
      const pendingIds = newItems.filter((q) => q.status === "pending").map((q) => q.id);
      await BlogServices.reorderQueue(pendingIds);
      showToast("Queue priority sequence reordered.", "success");
      await loadMetadata();
    } catch (err) {
      showToast(err.response?.data?.message || "Reordering failed. Resetting.", "error");
      await loadQueue(queuePagination.page);
    }
  };

  // Action: Revalidate Cache
  const handleRevalidateItem = async (slug) => {
    try {
      const res = await BlogServices.revalidateBlogCache(slug);
      showToast(`Cache purged & on-demand revalidated for /blog/${slug}!`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Cache revalidation failed", "error");
      throw err;
    }
  };

  // Action: Save Settings
  const handleSaveSettings = async (data) => {
    setIsSavingSettings(true);
    try {
      const res = await BlogServices.updateSchedulerSettings(data);
      setSettings(res.data || res);
      showToast("Scheduler settings successfully updated.", "success");
      await loadMetadata();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save scheduler settings", "error");
      throw err;
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Action: Trigger Cron Tick Immediately
  const handleTriggerCron = async () => {
    setIsTriggeringCron(true);
    try {
      const res = await BlogServices.triggerCronTick();
      if (res.executed) {
        showToast(res.message || "Scheduler tick completed successfully!", "success");
        broadcastBlogChange();
      } else {
        showToast(res.message || `Tick skipped: ${res.reason}`, "info");
      }
      await handleRefreshAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to trigger cron tick", "error");
    } finally {
      setIsTriggeringCron(false);
    }
  };

  const navTabs = [
    { id: "queue", label: "Publishing Queue", icon: Layers, count: stats?.counts?.pending || 0 },
    { id: "import", label: "Bulk Ingestion", icon: UploadCloud },
    { id: "settings", label: "Scheduler Controls", icon: Settings },
    { id: "history", label: "Audit Logs", icon: History, count: stats?.counts?.total || 0 },
  ];

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#012CEB]" />
        </div>
      }
    >
      <DashboardLayout
        activeView="blog-scheduler"
        user={user}
        onLogout={logout}
        onRefreshSession={refreshAccessToken}
      >
        <div className="space-y-6 pb-12">
          {/* Toast Notification Banner */}
          {toast && (
            <div
              className={`p-4 rounded-xl border-2 border-[#14100E] shadow-[4px_4px_0_#14100E] flex items-center justify-between gap-3 animate-fadeIn text-xs font-mono font-bold ${
                toast.type === "error"
                  ? "bg-rose-500 text-white"
                  : toast.type === "info"
                  ? "bg-[#14100E] text-[#F4EDE4]"
                  : "bg-emerald-600 text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {toast.type === "error" ? (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                ) : toast.type === "info" ? (
                  <Info className="w-4 h-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                )}
                <span>{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="p-1 rounded hover:bg-black/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Section: Header */}
          <SchedulerHeader
            onRefresh={handleRefreshAll}
            isRefreshing={isRefreshing}
            onTriggerCron={handleTriggerCron}
            isTriggeringCron={isTriggeringCron}
            workerStatus={workerHealth?.worker}
            settings={settings}
          />

          {/* Section 1: Overview Metrics (Always visible) */}
          <SchedulerOverview
            stats={stats}
            workerHealth={workerHealth}
            settings={settings}
            isLoading={isRefreshing && !stats}
          />

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b-2 border-[#14100E]/15 pb-2 overflow-x-auto">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold inline-flex items-center gap-2 transition-all shrink-0 ${
                    isActive
                      ? "bg-[#14100E] text-[#F4EDE4] shadow-[3px_3px_0_#012CEB] -translate-y-0.5"
                      : "bg-[#F4EFE6] border border-[#14100E]/20 text-[#6B625A] hover:text-[#14100E] hover:bg-black/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                        isActive
                          ? "bg-[#012CEB] text-white"
                          : "bg-black/10 text-[#14100E]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content 1: Publishing Queue */}
          {activeTab === "queue" && (
            <div className="space-y-4 animate-fadeIn">
              <SchedulerQueueTable
                items={queueItems}
                pagination={queuePagination}
                isLoading={isQueueLoading}
                statusFilter={queueStatus}
                searchQuery={queueSearch}
                onStatusChange={(newStatus) => {
                  setQueueStatus(newStatus);
                  loadQueue(1, newStatus, queueSearch);
                }}
                onSearchChange={(query) => setQueueSearch(query)}
                onPageChange={(newPage) => loadQueue(newPage, queueStatus, queueSearch)}
                onManualPublish={handleManualPublish}
                onCancelItem={handleCancelItem}
                onRetryItem={handleRetryItem}
                onReorderItem={handleReorderItem}
                onRevalidateItem={handleRevalidateItem}
              />
            </div>
          )}

          {/* Tab Content 2: Bulk Ingestion */}
          {activeTab === "import" && (
            <div className="space-y-4 animate-fadeIn">
              <SchedulerBulkImport
                onImportComplete={async () => {
                  showToast("Bulk upload finished! Queued articles are now visible.", "success");
                  await handleRefreshAll();
                  setActiveTab("queue");
                }}
              />
            </div>
          )}

          {/* Tab Content 3: Settings */}
          {activeTab === "settings" && (
            <div className="space-y-4 animate-fadeIn">
              <SchedulerSettingsCard
                settings={settings}
                workerHealth={workerHealth}
                onSaveSettings={handleSaveSettings}
                onTriggerCron={handleTriggerCron}
                isSaving={isSavingSettings}
                isTriggering={isTriggeringCron}
              />
            </div>
          )}

          {/* Tab Content 4: Audit Logs */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-fadeIn">
              <SchedulerHistoryTable
                logs={historyLogs}
                pagination={historyPagination}
                isLoading={isHistoryLoading}
                statusFilter={historyStatus}
                onStatusChange={(st) => {
                  setHistoryStatus(st);
                  loadHistory(1, st);
                }}
                onPageChange={(pg) => loadHistory(pg, historyStatus)}
              />
            </div>
          )}
        </div>
      </DashboardLayout>
    </Suspense>
  );
}

