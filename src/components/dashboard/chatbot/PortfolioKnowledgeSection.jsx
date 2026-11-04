"use client";

import React, { useState, useEffect, useCallback } from "react";
import KnowledgeOverviewCards from "./KnowledgeOverviewCards";
import KnowledgeFiltersBar from "./KnowledgeFiltersBar";
import KnowledgeTable from "./KnowledgeTable";
import KnowledgeFormModal from "./KnowledgeFormModal";
import KnowledgeDeleteModal from "./KnowledgeDeleteModal";
import KnowledgeSearchTestModal from "./KnowledgeSearchTestModal";
import { knowledgeService } from "@/api";

export default function PortfolioKnowledgeSection() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
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

    // Fetch Categories
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
            console.warn("Failed to fetch knowledge categories:", err);
        }
    }, []);

    // Fetch Knowledge List
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

                    if (res.pagination) {
                        setTotal(res.pagination.total || dataList.length);
                        setTotalPages(res.pagination.totalPages || 1);
                    } else {
                        setTotal(dataList.length);
                        setTotalPages(1);
                    }

                    // Compute overview stats
                    const pub = dataList.filter((k) => (k.status || "").toLowerCase() === "published").length;
                    const drf = dataList.filter((k) => (k.status || "").toLowerCase() === "draft").length;
                    const arc = dataList.filter((k) => (k.status || "").toLowerCase() === "archived").length;
                    setStats({
                        total: res.pagination?.total || dataList.length,
                        published: pub,
                        draft: drf,
                        archived: arc,
                    });
                }
            } catch (err) {
                console.error("Failed to load knowledge records:", err);
                setError(err?.response?.data?.message || err.message || "Failed to load knowledge records.");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [search, category, status, page, limit]
    );

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchKnowledge();
    }, [fetchKnowledge]);

    const handleResetFilters = () => {
        setSearch("");
        setCategory("");
        setStatus("");
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

    // Save Create / Update
    const handleSaveKnowledge = async (payload, id = null) => {
        setSaving(true);
        try {
            if (id) {
                await knowledgeService.updateKnowledge(id, payload);
            } else {
                await knowledgeService.createKnowledge(payload);
            }
            setFormModalOpen(false);
            setEditingItem(null);
            fetchKnowledge(true);
            fetchCategories();
        } catch (err) {
            console.error("Failed to save knowledge:", err);
            alert(err?.response?.data?.message || "Failed to save knowledge record.");
        } finally {
            setSaving(false);
        }
    };

    // Quick Status / Publish Toggle
    const handleTogglePublish = async (item) => {
        const isPublished = (item.status || "").toLowerCase() === "published";
        const newStatus = isPublished ? "draft" : "published";

        // Optimistic UI update
        setItems((prev) =>
            prev.map((k) => (k.id === item.id ? { ...k, status: newStatus, is_published: !isPublished } : k))
        );

        try {
            await knowledgeService.updateStatus(item.id, newStatus, !isPublished);
            fetchKnowledge(true);
        } catch (err) {
            console.error("Status toggle error:", err);
            fetchKnowledge(true);
        }
    };

    const handleDeleteRequest = (item) => {
        setDeleteCandidate(item);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;
        setDeleting(true);

        try {
            await knowledgeService.deleteKnowledge(deleteCandidate.id);
            setItems((prev) => prev.filter((k) => k.id !== deleteCandidate.id));
            setDeleteModalOpen(false);
            setDeleteCandidate(null);
            fetchKnowledge(true);
            fetchCategories();
        } catch (err) {
            console.error("Failed to delete knowledge:", err);
            alert(err?.response?.data?.message || "Failed to delete knowledge record.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D6CDC2] pb-4">
                <div>
                    <h1 className="font-sans font-bold text-xl text-[#14100E]">
                        Portfolio Knowledge Base
                    </h1>
                    <p className="text-xs text-[#6B625A] mt-0.5">
                        Manage factual knowledge, gear packages, and project details referenced by the AI assistant.
                    </p>
                </div>
            </div>

            {/* 1. Overview KPI Cards */}
            <KnowledgeOverviewCards stats={stats} categoriesCount={categories.length} />

            {/* 2. Filters & Actions Bar */}
            <KnowledgeFiltersBar
                search={search}
                onSearchChange={(v) => {
                    setSearch(v);
                    setPage(1);
                }}
                category={category}
                onCategoryChange={(v) => {
                    setCategory(v);
                    setPage(1);
                }}
                categories={categories}
                status={status}
                onStatusChange={(v) => {
                    setStatus(v);
                    setPage(1);
                }}
                onResetFilters={handleResetFilters}
                onRefresh={() => {
                    fetchKnowledge(true);
                    fetchCategories();
                }}
                refreshing={refreshing}
                onOpenCreateModal={handleOpenCreateModal}
                onOpenTestSearchModal={() => setTestSearchOpen(true)}
            />

            {/* 3. Knowledge Listing Table */}
            <KnowledgeTable
                items={items}
                loading={loading}
                error={error}
                onEditItem={handleOpenEditModal}
                onDeleteItem={handleDeleteRequest}
                onTogglePublish={handleTogglePublish}
                pagination={{ page, limit, total, totalPages }}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                    setLimit(l);
                    setPage(1);
                }}
                onRetry={() => fetchKnowledge()}
                onOpenCreateModal={handleOpenCreateModal}
            />

            {/* 4. Add / Edit Knowledge Modal */}
            <KnowledgeFormModal
                isOpen={formModalOpen}
                onClose={() => {
                    setFormModalOpen(false);
                    setEditingItem(null);
                }}
                onSave={handleSaveKnowledge}
                initialData={editingItem}
                categories={categories}
                saving={saving}
            />

            {/* 5. Delete Confirmation Modal */}
            <KnowledgeDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeleteCandidate(null);
                }}
                onConfirm={handleConfirmDelete}
                item={deleteCandidate}
                deleting={deleting}
            />

            {/* 6. Knowledge AI Search Simulation Modal */}
            <KnowledgeSearchTestModal
                isOpen={testSearchOpen}
                onClose={() => setTestSearchOpen(false)}
            />
        </div>
    );
}
