"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { chatbotLeadService } from "@/api";
import { DEFAULT_FILTERS, DEFAULT_PAGINATION } from "../config/chatbotLeadsConfig";

const ChatbotLeadsContext = createContext(null);

export function ChatbotLeadsProvider({ children }) {
    // Lead List & Aggregates
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        contacted: 0,
        in_discussion: 0,
        qualified: 0,
        converted: 0,
        closed: 0,
        rejected: 0,
        spam: 0,
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState(DEFAULT_FILTERS.search);
    const [status, setStatus] = useState(DEFAULT_FILTERS.status);
    const [projectType, setProjectType] = useState(DEFAULT_FILTERS.projectType);
    const [startDate, setStartDate] = useState(DEFAULT_FILTERS.startDate);
    const [endDate, setEndDate] = useState(DEFAULT_FILTERS.endDate);

    // Server Pagination
    const [page, setPage] = useState(DEFAULT_PAGINATION.page);
    const [limit, setLimit] = useState(DEFAULT_PAGINATION.limit);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Drawer (Lead Details & Transcript)
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loadingLeadDetails, setLoadingLeadDetails] = useState(false);
    const [savingLead, setSavingLead] = useState(false);
    const [activeDrawerTab, setActiveDrawerTab] = useState("overview");

    // Delete Modal
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // API Call: Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await chatbotLeadService.getLeadStats();
            if (res?.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.warn("[ChatbotLeadsProvider] Failed to fetch stats:", err);
        }
    }, []);

    // API Call: Fetch Paginated & Filtered Leads
    const fetchLeads = useCallback(
        async (isSilent = false) => {
            if (!isSilent) setLoading(true);
            else setRefreshing(true);
            setError(null);

            try {
                const res = await chatbotLeadService.getLeads({
                    search: search || undefined,
                    status: status || undefined,
                    projectType: projectType || undefined,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    page,
                    limit,
                });

                if (res?.data) {
                    setLeads(res.data);
                    if (res.pagination) {
                        setTotal(res.pagination.total || 0);
                        setTotalPages(res.pagination.totalPages || 1);
                    }
                }
            } catch (err) {
                console.error("[ChatbotLeadsProvider] Failed to load leads:", err);
                setError(err?.response?.data?.message || err.message || "Failed to load enquiries.");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [search, status, projectType, startDate, endDate, page, limit]
    );

    // API Call: Fetch Single Lead with Transcript
    const fetchLeadDetails = useCallback(async (id) => {
        if (!id) return null;
        setLoadingLeadDetails(true);
        try {
            const res = await chatbotLeadService.getLeadById(id);
            if (res?.data) {
                setSelectedLead(res.data);
                return res.data;
            }
        } catch (err) {
            console.error("[ChatbotLeadsProvider] Failed to load lead details:", err);
            return null;
        } finally {
            setLoadingLeadDetails(false);
        }
    }, []);

    // Initial and reactive data fetching
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Drawer fetching when selectedLeadId changes
    useEffect(() => {
        if (selectedLeadId && drawerOpen) {
            fetchLeadDetails(selectedLeadId);
        } else {
            setSelectedLead(null);
        }
    }, [selectedLeadId, drawerOpen, fetchLeadDetails]);

    // Filter Handlers
    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
    };

    const handleStatusChange = (val) => {
        setStatus(val);
        setPage(1);
    };

    const handleProjectTypeChange = (val) => {
        setProjectType(val);
        setPage(1);
    };

    const handleStartDateChange = (val) => {
        setStartDate(val);
        setPage(1);
    };

    const handleEndDateChange = (val) => {
        setEndDate(val);
        setPage(1);
    };

    const handleResetFilters = () => {
        setSearch("");
        setStatus("");
        setProjectType("");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    const handlePageChange = (p) => {
        setPage(p);
    };

    const handleLimitChange = (l) => {
        setLimit(l);
        setPage(1);
    };

    // Drawer Handlers
    const handleOpenDrawer = (leadId) => {
        setSelectedLeadId(leadId);
        setActiveDrawerTab("overview");
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedLeadId(null);
        setSelectedLead(null);
    };

    // API Call: Update Status
    const handleUpdateStatus = async (leadId, newStatus) => {
        try {
            // Optimistic local update
            setLeads((prev) =>
                prev.map((l) => (l.id === leadId ? { ...l, lead_status: newStatus } : l))
            );
            if (selectedLead?.id === leadId) {
                setSelectedLead((prev) => (prev ? { ...prev, lead_status: newStatus } : null));
            }

            await chatbotLeadService.updateLeadStatus(leadId, newStatus);
            fetchStats();
        } catch (err) {
            console.error("[ChatbotLeadsProvider] Status update failed:", err);
            // Roll back on failure
            fetchLeads(true);
            fetchStats();
        }
    };

    // API Call: Update Lead Fields
    const handleUpdateLead = async (leadId, updatedData) => {
        setSavingLead(true);
        try {
            const res = await chatbotLeadService.updateLead(leadId, updatedData);
            const saved = res?.data || updatedData;

            setLeads((prev) =>
                prev.map((l) => (l.id === leadId ? { ...l, ...saved } : l))
            );
            if (selectedLead?.id === leadId) {
                setSelectedLead((prev) => (prev ? { ...prev, ...saved } : null));
            }
            return { success: true, data: saved };
        } catch (err) {
            console.error("[ChatbotLeadsProvider] Failed to update lead:", err);
            return {
                success: false,
                error: err?.response?.data?.message || err.message || "Failed to save changes",
            };
        } finally {
            setSavingLead(false);
        }
    };

    // Delete Modal Handlers & API Call
    const handleOpenDeleteModal = (lead) => {
        setDeleteCandidate(lead);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeleteCandidate(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;
        setDeleting(true);

        try {
            await chatbotLeadService.deleteLead(deleteCandidate.id);
            setLeads((prev) => prev.filter((l) => l.id !== deleteCandidate.id));
            setDeleteModalOpen(false);
            setDeleteCandidate(null);

            if (drawerOpen && selectedLeadId === deleteCandidate.id) {
                handleCloseDrawer();
            }

            fetchStats();
        } catch (err) {
            console.error("[ChatbotLeadsProvider] Delete failed:", err);
            alert(err?.response?.data?.message || "Failed to delete lead record.");
        } finally {
            setDeleting(false);
        }
    };

    const handleRefresh = () => {
        fetchLeads(true);
        fetchStats();
    };

    const value = {
        // State
        leads,
        stats,
        loading,
        refreshing,
        error,
        search,
        status,
        projectType,
        startDate,
        endDate,
        page,
        limit,
        total,
        totalPages,
        selectedLeadId,
        selectedLead,
        drawerOpen,
        loadingLeadDetails,
        savingLead,
        activeDrawerTab,
        deleteCandidate,
        deleteModalOpen,
        deleting,

        // Setters / Handlers
        setActiveDrawerTab,
        handleSearchChange,
        handleStatusChange,
        handleProjectTypeChange,
        handleStartDateChange,
        handleEndDateChange,
        handleResetFilters,
        handlePageChange,
        handleLimitChange,
        handleOpenDrawer,
        handleCloseDrawer,
        handleUpdateStatus,
        handleUpdateLead,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
        handleConfirmDelete,
        handleRefresh,
        fetchLeads,
        fetchStats,
    };

    return (
        <ChatbotLeadsContext.Provider value={value}>
            {children}
        </ChatbotLeadsContext.Provider>
    );
}

export function useChatbotLeads() {
    const context = useContext(ChatbotLeadsContext);
    if (!context) {
        throw new Error("useChatbotLeads must be used within a ChatbotLeadsProvider");
    }
    return context;
}

