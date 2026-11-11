/**
 * Dynamic configuration and schema for Portfolio Knowledge Base.
 * Defines all field names, columns, publication statuses, suggested categories, and KPI cards.
 */

export const KNOWLEDGE_STATUSES = [
    {
        value: "",
        label: "All Statuses",
        badgeBg: "bg-neutral-100 text-neutral-700 border-neutral-200",
    },
    {
        value: "published",
        label: "Published",
        badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
        iconName: "Globe",
        description: "Live & accessible to the AI Portfolio Assistant",
    },
    {
        value: "draft",
        label: "Draft",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
        iconName: "Lock",
        description: "Internal only, hidden from visitors",
    },
    {
        value: "archived",
        label: "Archived",
        badgeBg: "bg-neutral-100 text-neutral-700 border-neutral-300",
        iconName: "Archive",
        description: "Deprecated or inactive facts",
    },
];

export const DEFAULT_SUGGESTED_CATEGORIES = [
    "commercial",
    "Services",
    "Lenses and Gear",
    "Frequently Asked Questions",
    "Portfolio Projects",
    "Personal Information",
    "Camera Equipment",
    "Lighting & Optics",
    "Rates & Bookings",
    "Bio & Background",
    "Directing & Cine Style",
];

export const OVERVIEW_CARDS_CONFIG = [
    {
        id: "total",
        label: "Total Knowledge",
        statKey: "total",
        iconName: "BookOpen",
        color: "text-[#14100E]",
        bgColor: "bg-[#EAE2D7]",
        subtext: "Facts, gear & projects",
    },
    {
        id: "published",
        label: "Published (Live)",
        statKey: "published",
        iconName: "CheckCircle",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50 border-emerald-200",
        subtext: "Accessible by AI Assistant",
    },
    {
        id: "draft",
        label: "Drafts (Hidden)",
        statKey: "draft",
        iconName: "FileEdit",
        color: "text-amber-700",
        bgColor: "bg-amber-50 border-amber-200",
        subtext: "Work-in-progress notes",
    },
    {
        id: "archived",
        label: "Archived",
        statKey: "archived",
        iconName: "Archive",
        color: "text-neutral-700",
        bgColor: "bg-neutral-100 border-neutral-300",
        subtext: "Inactive or deprecated",
    },
    {
        id: "categories",
        label: "Categories",
        statKey: "categoriesCount",
        iconName: "Tag",
        color: "text-purple-700",
        bgColor: "bg-purple-50 border-purple-200",
        subtext: "Curated knowledge groups",
    },
];

export const KNOWLEDGE_FIELDS = {
    title: {
        key: "title",
        label: "Title / Query Trigger",
        type: "text",
        placeholder: "e.g. What cameras does Anup Rawat shoot with?",
        required: true,
    },
    content: {
        key: "content",
        label: "Knowledge Fact / Answer Content",
        type: "textarea",
        placeholder: "Enter accurate cinematography details, lens specs, rates, or project notes...",
        required: true,
    },
    category: {
        key: "category",
        label: "Category",
        type: "text",
        placeholder: "e.g. Camera Equipment, Commercial, Services",
        required: true,
    },
    project: {
        key: "project",
        label: "Associated Project",
        type: "text",
        placeholder: "e.g. Delhi Metro Transit Campaign (optional)",
        required: false,
    },
    keywords: {
        key: "keywords",
        label: "Search Keywords & Tags (Comma-separated)",
        type: "text",
        placeholder: "e.g. arri, alexa, anamorphic, lenses, 4k",
        required: false,
    },
    status: {
        key: "status",
        label: "Publication Status",
        type: "select",
        options: KNOWLEDGE_STATUSES.filter((s) => s.value !== ""),
        required: true,
    },
};

export const TABLE_COLUMNS = [
    { key: "title_content", label: "Title / Knowledge Fact", width: "w-1/3" },
    { key: "category", label: "Category", width: "w-1/8" },
    { key: "project", label: "Project", width: "w-1/8" },
    { key: "keywords", label: "Keywords", width: "w-1/6" },
    { key: "status", label: "Status", width: "w-1/10" },
    { key: "updated_at", label: "Updated", width: "w-1/10" },
    { key: "actions", label: "Actions", width: "w-24 text-right" },
];

export const DEFAULT_FILTERS = {
    search: "",
    category: "",
    status: "",
};

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 20,
};

