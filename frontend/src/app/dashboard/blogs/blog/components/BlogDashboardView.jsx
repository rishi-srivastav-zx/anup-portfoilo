"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import BlogDashboardHeader from "./BlogDashboardHeader";
import BlogMetricsCards from "./BlogMetricsCards";
import BlogFiltersBar from "./BlogFiltersBar";
import BlogTable from "./BlogTable";
import BlogEmptyState from "./BlogEmptyState";
import BlogDeleteModal from "./BlogDeleteModal";
import BlogFeaturedModal from "./BlogFeaturedModal";
import { STORAGE_KEY_ARTICLES } from "../../blogs-form/context/BlogFormProvider";
import BlogServices from "@/api/services/blog.services";

const PAGE_SIZE = 10;

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

export default function BlogDashboardView() {
  const searchParams = useSearchParams();
  const statusParam = searchParams ? searchParams.get("status") : null;

  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [page, setPage] = useState(1);
  const [statsData, setStatsData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return statusParam && ["published", "draft"].includes(statusParam.toLowerCase())
      ? statusParam.toLowerCase()
      : "ALL";
  });
  const [sortBy, setSortBy] = useState("date_desc");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featuredTarget, setFeaturedTarget] = useState(null);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);

  const showFeedback = (text, type = "info") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Sync with search parameter when navigating
  useEffect(() => {
    if (statusParam && ["published", "draft"].includes(statusParam.toLowerCase())) {
      setSelectedStatus(statusParam.toLowerCase());
      setPage(1);
    } else if (statusParam === null) {
      setSelectedStatus("ALL");
    }
  }, [statusParam]);

  // Debounce search query to avoid firing API requests on every single keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page to 1 when filters or sort change
  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((st) => {
    setSelectedStatus(st);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((sort) => {
    setSortBy(sort);
    setPage(1);
  }, []);

  // Load articles & stats strictly from Backend API with server-side pagination & filtering
  const loadArticles = useCallback(
    async (forceRefresh = false) => {
      setIsRefreshing(true);
      try {
        const queryParams = {
          page,
          limit: PAGE_SIZE,
          status: selectedStatus === "ALL" ? "all" : selectedStatus,
        };

        if (debouncedSearch.trim()) {
          queryParams.search = debouncedSearch.trim();
        }

        if (selectedCategory !== "ALL") {
          queryParams.category = selectedCategory;
        }

        if (sortBy === "date_desc") {
          queryParams.sortBy = "publishedAt";
          queryParams.order = "desc";
        } else if (sortBy === "date_asc") {
          queryParams.sortBy = "publishedAt";
          queryParams.order = "asc";
        } else if (sortBy === "title_asc") {
          queryParams.sortBy = "title";
          queryParams.order = "asc";
        } else if (sortBy === "read_desc") {
          queryParams.sortBy = "readingTime";
          queryParams.order = "desc";
        }

        if (forceRefresh) {
          queryParams.noCache = true;
        }

        const [blogsRes, statsRes] = await Promise.allSettled([
          BlogServices.getBlogs(queryParams),
          BlogServices.getStats(),
        ]);

        if (blogsRes.status === "fulfilled" && blogsRes.value?.success) {
          const rawData = blogsRes.value.data;
          const items = Array.isArray(rawData)
            ? rawData
            : Array.isArray(rawData?.items)
            ? rawData.items
            : [];
          setArticles(items);
          if (blogsRes.value.pagination) {
            setPagination(blogsRes.value.pagination);
          } else {
            setPagination((prev) => ({
              ...prev,
              total: items.length,
              totalPages: Math.ceil(items.length / PAGE_SIZE) || 1,
            }));
          }
        } else {
          setArticles([]);
        }

        if (statsRes.status === "fulfilled" && statsRes.value?.success) {
          setStatsData(statsRes.value.data);
        } else {
          setStatsData(null);
        }
      } catch (err) {
        console.warn("Backend API getBlogs error:", err?.message || err);
        setArticles([]);
      } finally {
        setIsRefreshing(false);
      }
    },
    [page, selectedStatus, debouncedSearch, selectedCategory, sortBy]
  );

  useEffect(() => {
    // Purge any stale static mock data from local storage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY_ARTICLES);
      } catch (e) {
        // ignore
      }
    }

    loadArticles();

    // Listen to external storage updates from the blog form
    const handleUpdate = () => {
      loadArticles(true);
    };

    window.addEventListener("studio_articles_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("studio_articles_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadArticles]);

  // Toggle Draft / Published status via API
  const handleToggleStatus = useCallback(
    async (id) => {
      const target = articles.find((a) => a.id === id);
      if (!target) return;
      const nextStatus = target.status === "published" ? "draft" : "published";

      // Optimistic local update
      setArticles((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: nextStatus, updatedAt: new Date().toISOString().split("T")[0] }
            : a
        )
      );

      try {
        await BlogServices.updateStatus(id, nextStatus);
        broadcastBlogChange();
        showFeedback(`Article status updated to ${nextStatus.toUpperCase()} via API.`, "success");
        // Refresh stats
        const sRes = await BlogServices.getStats().catch(() => null);
        if (sRes?.success) setStatsData(sRes.data);
      } catch (err) {
        console.error("API updateStatus failed:", err);
        // Rollback on failure
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: target.status } : a))
        );
        showFeedback(
          `Failed to update status via API: ${err.response?.data?.message || err.message}`,
          "error"
        );
      }
    },
    [articles]
  );

  // Open Featured Confirmation Popup
  const handleRequestFeatured = useCallback(
    (articleOrId) => {
      if (!articleOrId) return;
      const target =
        typeof articleOrId === "object"
          ? articleOrId
          : articles.find((a) => a.id === articleOrId);
      if (target) {
        setFeaturedTarget(target);
      }
    },
    [articles]
  );

  // Execute Toggle Featured Star via API after user confirmation in popup
  const handleConfirmFeatured = useCallback(
    async (id) => {
      const target = articles.find((a) => a.id === id) || featuredTarget;
      if (!target) {
        setFeaturedTarget(null);
        return;
      }
      const nextFeatured = !target.isFeatured;
      setIsTogglingFeatured(true);

      // Optimistic local update: ensure ONLY ONE article can be featured
      setArticles((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return { ...a, isFeatured: nextFeatured };
          }
          // If featuring this article, ensure all other articles become unfeatured
          return nextFeatured ? { ...a, isFeatured: false } : a;
        })
      );

      try {
        await BlogServices.toggleFeatured(id);
        broadcastBlogChange();
        setFeaturedTarget(null);
        showFeedback(
          nextFeatured
            ? "Article marked as FEATURED lead (Only 1 featured article active)."
            : "Featured lead status removed.",
          "success"
        );
        const sRes = await BlogServices.getStats().catch(() => null);
        if (sRes?.success) setStatsData(sRes.data);
      } catch (err) {
        console.error("API toggleFeatured failed:", err);
        // Rollback
        setArticles((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isFeatured: target.isFeatured } : a))
        );
        showFeedback(
          `Failed to toggle featured via API: ${err.response?.data?.message || err.message}`,
          "error"
        );
      } finally {
        setIsTogglingFeatured(false);
        setFeaturedTarget(null);
      }
    },
    [articles, featuredTarget]
  );

  // Delete article via API
  const handleDeleteConfirm = useCallback(
    async (id) => {
      if (!id) return;
      setIsDeleting(true);

      try {
        await BlogServices.deleteBlog(id);
        broadcastBlogChange();
        setDeleteTarget(null);
        showFeedback("Article deleted successfully from server.", "success");
        loadArticles(true);
      } catch (err) {
        console.error("API deleteBlog failed:", err);
        showFeedback(
          `Delete failed via API: ${err.response?.data?.message || err.message}`,
          "error"
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [loadArticles]
  );

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setSortBy("date_desc");
    setPage(1);
  }, []);

  const isFiltered = Boolean(
    debouncedSearch.trim() || selectedCategory !== "ALL" || selectedStatus !== "ALL"
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          className={`py-2 px-4 rounded-xl text-xs font-mono-tech border transition-all ${
            feedbackMsg.type === "error"
              ? "bg-red-50 text-red-900 border-red-300"
              : feedbackMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-blue-50 text-blue-900 border-blue-300"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* 1. Header with Title & Quick Create */}
      <BlogDashboardHeader
        onRefresh={() => loadArticles(true)}
        isRefreshing={isRefreshing}
        totalCount={pagination.total !== undefined ? pagination.total : (statsData?.total !== undefined ? statsData.total : articles.length)}
      />

      {/* 2. Metrics Cards */}
      <BlogMetricsCards articles={articles} stats={statsData} />

      {/* 3. Filters & Search Bar */}
      <BlogFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 4. Table or Empty State */}
      {articles.length > 0 ? (
        <div className="space-y-4">
          <BlogTable
            articles={articles}
            onToggleStatus={handleToggleStatus}
            onToggleFeatured={handleRequestFeatured}
            onRequestDelete={(art) => setDeleteTarget(art)}
          />

          {/* Server-Side Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border-2 border-[#14100E] bg-[#F4EFE6] shadow-[3px_3px_0_#14100E]">
              <div className="text-xs font-mono-tech text-[#6B625A]">
                Showing{" "}
                <span className="font-bold text-[#14100E]">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-[#14100E]">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-bold text-[#14100E]">{pagination.total}</span> articles
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrev || isRefreshing}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border-2 border-[#14100E] bg-white hover:bg-[#E6DDD2] disabled:opacity-40 disabled:cursor-not-allowed font-mono-tech text-xs font-bold text-[#14100E] shadow-[2px_2px_0_#14100E] transition-all cursor-pointer"
                >
                  Previous
                </button>

                <div className="px-3 py-1 text-xs font-mono-tech font-bold text-[#14100E]">
                  Page {pagination.page} of {pagination.totalPages}
                </div>

                <button
                  type="button"
                  disabled={!pagination.hasNext || isRefreshing}
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border-2 border-[#14100E] bg-white hover:bg-[#E6DDD2] disabled:opacity-40 disabled:cursor-not-allowed font-mono-tech text-xs font-bold text-[#14100E] shadow-[2px_2px_0_#14100E] transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <BlogEmptyState
          isFiltered={isFiltered}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* 5. Delete Confirmation Modal */}
      <BlogDeleteModal
        article={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isSubmitting={isDeleting}
      />

      {/* 6. Featured Toggle Confirmation Modal */}
      <BlogFeaturedModal
        article={featuredTarget}
        isOpen={Boolean(featuredTarget)}
        onClose={() => !isTogglingFeatured && setFeaturedTarget(null)}
        onConfirm={handleConfirmFeatured}
        isSubmitting={isTogglingFeatured}
      />
    </div>
  );
}
