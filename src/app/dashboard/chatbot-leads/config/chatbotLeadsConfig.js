/**
 * Dynamic configuration and schema for Chatbot Leads & Enquiries.
 * Defines all field names, column mappings, pipeline statuses, project types, and KPI metrics.
 */

export const PIPELINE_STATUSES = [
    {
        value: "",
        label: "All Statuses",
        badgeBg: "bg-neutral-100 text-neutral-700 border-neutral-200",
        dotColor: "bg-neutral-400",
    },
    {
        value: "new",
        label: "New",
        badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
        dotColor: "bg-blue-600",
        description: "Awaiting first response from studio",
    },
    {
        value: "contacted",
        label: "Contacted",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
        dotColor: "bg-amber-600",
        description: "Outreach initiated via WhatsApp / Phone",
    },
    {
        value: "in_discussion",
        label: "In Discussion",
        badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
        dotColor: "bg-purple-600",
        description: "Active discussion on script / vision / requirements",
    },
    {
        value: "qualified",
        label: "Qualified",
        badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
        dotColor: "bg-indigo-600",
        description: "Budget, scope, and timeline aligned",
    },
    {
        value: "converted",
        label: "Converted",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        dotColor: "bg-emerald-600",
        description: "Production officially booked & scheduled",
    },
    {
        value: "closed",
        label: "Closed",
        badgeBg: "bg-neutral-100 text-neutral-700 border-neutral-300",
        dotColor: "bg-neutral-500",
        description: "Project completed or concluded",
    },
    {
        value: "rejected",
        label: "Rejected",
        badgeBg: "bg-rose-100 text-rose-700 border-rose-200",
        dotColor: "bg-rose-600",
        description: "Schedule mismatch or scope declined",
    },
    {
        value: "spam",
        label: "Spam",
        badgeBg: "bg-red-100 text-red-800 border-red-200",
        dotColor: "bg-red-600",
        description: "Automated or invalid query",
    },
];

export const PROJECT_TYPES = [
    { value: "", label: "All Project Types" },
    { value: "Commercial", label: "Commercial" },
    { value: "Music Video", label: "Music Video" },
    { value: "Documentary", label: "Documentary" },
    { value: "Brand Film", label: "Brand Film" },
    { value: "Narrative Film", label: "Narrative Film" },
    { value: "Corporate", label: "Corporate" },
    { value: "Fashion / Editorial", label: "Fashion / Editorial" },
    { value: "Short Film", label: "Short Film" },
    { value: "Feature Film", label: "Feature Film" },
    { value: "Other", label: "Other" },
];

export const OVERVIEW_CARDS_CONFIG = [
    {
        id: "total",
        label: "Total Leads",
        statKey: "total",
        iconName: "Users",
        color: "text-[#14100E]",
        bgColor: "bg-[#EAE2D7]",
        subtext: "All AI assistant enquiries",
    },
    {
        id: "new",
        label: "New Enquiries",
        statKey: "new",
        iconName: "Sparkles",
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200",
        subtext: "Awaiting first response",
    },
    {
        id: "in_discussion",
        label: "In Discussion",
        statKey: "in_discussion",
        iconName: "MessageCircle",
        color: "text-purple-700",
        bgColor: "bg-purple-50 border-purple-200",
        subtext: "Active conversations",
    },
    {
        id: "qualified",
        label: "Qualified",
        statKey: "qualified",
        iconName: "CheckCircle2",
        color: "text-indigo-700",
        bgColor: "bg-indigo-50 border-indigo-200",
        subtext: "Budget & date aligned",
    },
    {
        id: "converted",
        label: "Converted",
        statKey: "converted",
        iconName: "Trophy",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50 border-emerald-200",
        subtext: "Booked productions",
    },
];

export const LEAD_FIELDS = {
    visitor_name: {
        key: "visitor_name",
        label: "Visitor / Client Name",
        type: "text",
        placeholder: "e.g. Rahul Sharma",
        required: true,
    },
    phone: {
        key: "phone",
        label: "Phone / WhatsApp",
        type: "tel",
        placeholder: "e.g. +91 98765 43210",
        required: true,
    },
    email: {
        key: "email",
        label: "Email Address",
        type: "email",
        placeholder: "e.g. producer@agency.com",
        required: false,
    },
    project_type: {
        key: "project_type",
        label: "Project Type",
        type: "select",
        options: PROJECT_TYPES.filter((p) => p.value !== ""),
        required: false,
    },
    budget: {
        key: "budget",
        label: "Budget Estimate",
        type: "text",
        placeholder: "e.g. ₹5L – ₹15L or $10k",
        required: false,
    },
    preferred_date: {
        key: "preferred_date",
        label: "Shoot Timeline",
        type: "text",
        placeholder: "e.g. Q4 2026 or Immediate",
        required: false,
    },
    location: {
        key: "location",
        label: "Production Location",
        type: "text",
        placeholder: "e.g. Mumbai / Dehradun / Remote",
        required: false,
    },
    project_description: {
        key: "project_description",
        label: "Project Description & Creative Brief",
        type: "textarea",
        placeholder: "Brief creative scope, cameras requested, mood references...",
        required: false,
    },
    lead_status: {
        key: "lead_status",
        label: "Pipeline Stage",
        type: "select",
        options: PIPELINE_STATUSES.filter((s) => s.value !== ""),
        required: true,
    },
};

export const TABLE_COLUMNS = [
    { key: "visitor_name", label: "Visitor / Client", width: "w-1/4" },
    { key: "phone", label: "Phone / WhatsApp", width: "w-1/6 font-mono" },
    { key: "project_type", label: "Project Type", width: "w-1/6" },
    { key: "budget", label: "Budget", width: "w-1/8 font-mono" },
    { key: "preferred_date", label: "Timeline", width: "w-1/8" },
    { key: "lead_status", label: "Status", width: "w-1/8" },
    { key: "created_at", label: "Submitted", width: "w-1/8" },
    { key: "actions", label: "Actions", width: "w-20 text-right" },
];

export const DEFAULT_FILTERS = {
    search: "",
    status: "",
    projectType: "",
    startDate: "",
    endDate: "",
};

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 20,
};

