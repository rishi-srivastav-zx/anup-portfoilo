"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { knowledgeService } from "@/api";
import {
    DEFAULT_FILTERS,
    DEFAULT_PAGINATION,
    DEFAULT_SUGGESTED_CATEGORIES,
} from "../config/portfolioKnowledgeConfig";

const PortfolioKnowledgeContext = createContext(null);

export function PortfolioKnowledgeProvider({ children }) {
    // Knowledge items and stats
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState(DEFAULT_SUGGESTED_CATEGORIES);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
        categoriesCount: DEFAULT_SUGGESTED_CATEGORIES.length,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState(DEFAULT_FILTERS.search);
    const [category, setCategory] = useState(DEFAULT_FILTERS.category);
    const [status, setStatus] = useState(DEFAULT_FILTERS.status);

    // Server Pagination
    const [page, setPage] = useState(DEFAULT_PAGINATION.page);
    const [limit, setLimit] = useState(DEFAULT_PAGINATION.limit);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);

    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [testSearchOpen, setTestSearchOpen] = useState(false);

    // API Call: Fetch Categories
    const fetchCategories = useCallback(async () => {
        try {
            const res = await knowledgeService.getCategories();
            if (Array.isArray(res?.data)) {
                setCategories(res.data);
            } else if (res?.data && (Array.isArray(res.data.suggestedCategories) || Array.isArray(res.data.activeCategories))) {
                const combined = Array.from(new Set([
                    ...(res.data.suggestedCategories || []),
                    ...(res.data.activeCategories || []),
                ]));
                setCategories(combined);
            } else if (Array.isArray(res?.categories)) {
                setCategories(res.categories);
            } else if (Array.isArray(res)) {
                setCategories(res);
            }
        } catch (err) {
            console.warn("[PortfolioKnowledgeProvider] Failed to fetch categories:", err);
        }
    }, []);

    // API Call: Fetch Knowledge List
    const fetchKnowledge = useCallback(
        async (isSilent = false) => {
            if (!isSilent) setLoading(true);
            else setRefreshing(true);
            setError(null);

            try {
                const res = await knowledgeService.getKnowledge({
                    search: search || undefined,
                    category: category || undefined,
                    status: status || undefined,
                    page,
                    limit,
                });

                if (res?.data) {
                    const dataList = Array.isArray(res.data) ? res.data : [];
                    setItems(dataList);

                    const totalCount = res.pagination?.total || dataList.length;
                    setTotal(totalCount);
                    setTotalPages(res.pagination?.totalPages || 1);

                    // Compute overview stats
                    const pub = dataList.filter((k) => (k.status || "").toLowerCase() === "published").length;
                    const drf = dataList.filter((k) => (k.status || "").toLowerCase() === "draft").length;
                    const arc = dataList.filter((k) => (k.status || "").toLowerCase() === "archived").length;

                    setStats((prev) => ({
                        ...prev,
                        total: totalCount,
                        published: pub,
                        draft: drf,
                        archived: arc,
                        categoriesCount: categories.length || DEFAULT_SUGGESTED_CATEGORIES.length,
                    }));
                }
            } catch (err) {
                console.error("[PortfolioKnowledgeProvider] Failed to load knowledge records:", err);
                setError(err?.response?.data?.message || err.message || "Failed to load knowledge records.");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [search, category, status, page, limit, categories.length]
    );

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchKnowledge();
    }, [fetchKnowledge]);

    // Handlers
    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const handleCategoryChange = (val) => {
        setCategory(val);
        setPage(1);
    };

    const handleStatusChange = (val) => {
        setStatus(val);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearch("");
        setCategory("");
        setStatus("");
        setPage(1);
    };

    const handlePageChange = (p) => setPage(p);
    const handleLimitChange = (l) => {
        setLimit(l);
        setPage(1);
    };

    const handleOpenCreateModal = () => {
        setEditingItem(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingItem(item);
        setFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setFormModalOpen(false);
        setEditingItem(null);
    };

    // API Call: Save Create / Update Knowledge Record
    const handleSaveKnowledge = async (payload, id = null) => {
        setSaving(true);
        try {
            if (id) {
                await knowledgeService.updateKnowledge(id, payload);
            } else {
                await knowledgeService.createKnowledge(payload);
            }
            handleCloseFormModal();
            fetchKnowledge(true);
            fetchCategories();
            return { success: true };
        } catch (err) {
            console.error("[PortfolioKnowledgeProvider] Failed to save knowledge:", err);
            alert(err?.response?.data?.message || "Failed to save knowledge record.");
            return { success: false, error: err };
        } finally {
            setSaving(false);
        }
    };

    // API Call: Quick Status / Publish Toggle
    const handleTogglePublish = async (item) => {
        const isPublished = (item.status || "").toLowerCase() === "published";
        const newStatus = isPublished ? "draft" : "published";

        // Optimistic UI update
        setItems((prev) =>
            prev.map((k) =>
                k.id === item.id ? { ...k, status: newStatus, is_published: !isPublished } : k
            )
        );

        try {
            await knowledgeService.updateStatus(item.id, newStatus, !isPublished);
            fetchKnowledge(true);
        } catch (err) {
            console.error("[PortfolioKnowledgeProvider] Status toggle error:", err);
            fetchKnowledge(true);
        }
    };

    // Delete Handlers
    const handleOpenDeleteModal = (item) => {
        setDeleteCandidate(item);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteCandidate(null);
    };

    // API Call: Delete Knowledge Record
    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;
        setDeleting(true);

        try {
            await knowledgeService.deleteKnowledge(deleteCandidate.id);
            setItems((prev) => prev.filter((k) => k.id !== deleteCandidate.id));
            handleCloseDeleteModal();
            fetchKnowledge(true);
            fetchCategories();
        } catch (err) {
            console.error("[PortfolioKnowledgeProvider] Delete error:", err);
            alert(err?.response?.data?.message || "Failed to delete knowledge record.");
        } finally {
            setDeleting(false);
        }
    };

    // API Call: Test AI Search
    const handleTestSearch = async (query) => {
        return await knowledgeService.testSearch(query);
    };

    const handleRefresh = () => {
        fetchKnowledge(true);
        fetchCategories();
    };

    const value = {
        // State
        items,
        categories,
        stats,
        loading,
        refreshing,
        error,
        search,
        category,
        status,
        page,
        limit,
        total,
        totalPages,
        formModalOpen,
        editingItem,
        saving,
        deleteCandidate,
        deleteModalOpen,
        deleting,
        testSearchOpen,

        // Handlers
        setTestSearchOpen,
        handleSearchChange,
        handleCategoryChange,
        handleStatusChange,
        handleResetFilters,
        handlePageChange,
        handleLimitChange,
        handleOpenCreateModal,
        handleOpenEditModal,
        handleCloseFormModal,
        handleSaveKnowledge,
        handleTogglePublish,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
        handleConfirmDelete,
        handleTestSearch,
        handleRefresh,
        fetchKnowledge,
        fetchCategories,
    };

    return (
        <PortfolioKnowledgeContext.Provider value={value}>
            {children}
        </PortfolioKnowledgeContext.Provider>
    );
}

export function usePortfolioKnowledge() {
    const context = useContext(PortfolioKnowledgeContext);
    if (!context) {
        throw new Error("usePortfolioKnowledge must be used within a PortfolioKnowledgeProvider");
    }
    return context;
}

