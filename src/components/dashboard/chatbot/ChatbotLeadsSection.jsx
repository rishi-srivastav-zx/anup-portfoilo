"use client";

import React, { useState, useEffect, useCallback } from "react";
import LeadOverviewCards from "./LeadOverviewCards";
import LeadFiltersBar from "./LeadFiltersBar";
import LeadTable from "./LeadTable";
import LeadDetailsDrawer from "./LeadDetailsDrawer";
import LeadDeleteModal from "./LeadDeleteModal";
import { chatbotLeadService } from "@/api";

export default function ChatbotLeadsSection() {
    const [leads, setLeads] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        contacted: 0,
        in_discussion: 0,
        qualified: 0,
        converted: 0,
        closed: 0,
        spam: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filter states
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [projectType, setProjectType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Modal & Drawer states
    const [selectedLeadId, setSelectedLeadId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await chatbotLeadService.getLeadStats();
            if (res?.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.warn("Failed to fetch lead stats:", err);
        }
    }, []);

    // Fetch Leads
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
                console.error("Failed to load leads:", err);
                setError(err?.response?.data?.message || err.message || "Failed to load enquiries.");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [search, status, projectType, startDate, endDate, page, limit]
    );

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Handlers
    const handleResetFilters = () => {
        setSearch("");
        setStatus("");
        setProjectType("");
        setStartDate("");
        setEndDate("");
        setPage(1);
    };

    const handleSelectLead = (id) => {
        setSelectedLeadId(id);
        setDrawerOpen(true);
    };

    const handleStatusUpdated = (leadId, newStatus) => {
        setLeads((prev) =>
            prev.map((l) => (l.id === leadId ? { ...l, lead_status: newStatus } : l))
        );
        fetchStats();
    };

    const handleLeadUpdated = (updatedLead) => {
        setLeads((prev) =>
            prev.map((l) => (l.id === updatedLead.id ? { ...l, ...updatedLead } : l))
        );
    };

    const handleDeleteRequest = (lead) => {
        setDeleteCandidate(lead);
        setDeleteModalOpen(true);
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
                setDrawerOpen(false);
                setSelectedLeadId(null);
            }
            fetchStats();
        } catch (err) {
            console.error("Lead deletion error:", err);
            alert(err?.response?.data?.message || "Failed to delete lead record.");
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
                        Chatbot Leads &amp; Project Enquiries
                    </h1>
                    <p className="text-xs text-[#6B625A] mt-0.5">
                        Manage incoming client enquiries captured by your portfolio AI assistant.
                    </p>
                </div>
            </div>

            {/* 1. Lead Overview KPI Cards */}
            <LeadOverviewCards stats={stats} loading={loading && !stats.total} />

            {/* 2. Filters Bar */}
            <LeadFiltersBar
                search={search}
                onSearchChange={(v) => {
                    setSearch(v);
                    setPage(1);
                }}
                status={status}
                onStatusChange={(v) => {
                    setStatus(v);
                    setPage(1);
                }}
                projectType={projectType}
                onProjectTypeChange={(v) => {
                    setProjectType(v);
                    setPage(1);
                }}
                startDate={startDate}
                onStartDateChange={(v) => {
                    setStartDate(v);
                    setPage(1);
                }}
                endDate={endDate}
                onEndDateChange={(v) => {
                    setEndDate(v);
                    setPage(1);
                }}
                onResetFilters={handleResetFilters}
                onRefresh={() => {
                    fetchLeads(true);
                    fetchStats();
                }}
                refreshing={refreshing}
            />

            {/* 3. Leads Table & Server Pagination */}
            <LeadTable
                leads={leads}
                loading={loading}
                error={error}
                onSelectLead={handleSelectLead}
                onDeleteLead={handleDeleteRequest}
                pagination={{ page, limit, total, totalPages }}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                    setLimit(l);
                    setPage(1);
                }}
                onRetry={() => fetchLeads()}
            />

            {/* 4. Slide-Over Lead Details Drawer */}
            <LeadDetailsDrawer
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedLeadId(null);
                }}
                leadId={selectedLeadId}
                onStatusUpdated={handleStatusUpdated}
                onLeadUpdated={handleLeadUpdated}
                onDeleteRequest={handleDeleteRequest}
            />

            {/* 5. Delete Confirmation Modal */}
            <LeadDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeleteCandidate(null);
                }}
                onConfirm={handleConfirmDelete}
                lead={deleteCandidate}
                deleting={deleting}
            />
        </div>
    );
}
