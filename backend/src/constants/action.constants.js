/**
 * Action Constants for Cinematographer Portfolio AI Assistant
 * Step 8: Section Navigation & Interactive Actions Engine
 */

export const ACTION_TYPES = Object.freeze({
    NAVIGATE_TO_SECTION: "NAVIGATE_TO_SECTION",
    NAVIGATE_TO_ROUTE: "NAVIGATE_TO_ROUTE",
    OPEN_PROJECT: "OPEN_PROJECT",
    OPEN_CONTACT_MODAL: "OPEN_CONTACT_MODAL",
    SCROLL_TO_TOP: "SCROLL_TO_TOP",
    PLAY_SHOWREEL: "PLAY_SHOWREEL",
    SUBMIT_LEAD: "SUBMIT_LEAD",
    EDIT_LEAD: "EDIT_LEAD",
    CANCEL_LEAD: "CANCEL_LEAD",
    SKIP_LEAD_FIELD: "SKIP_LEAD_FIELD",
});

export const ALLOWED_SECTIONS = Object.freeze([
    "#home",
    "#about",
    "#visuals",
    "#work",
    "#contact",
]);

export const ALLOWED_ROUTES = Object.freeze([
    "/",
    "/blog",
    "/dashboard",
    "/login",
]);

export const KNOWN_PROJECT_STATIONS = Object.freeze({
    "showreel": { stationIndex: 0, title: "Cinematography Showreel" },
    "krishna shukla": { stationIndex: 1, title: "Krishna Shukla" },
    "rntl": { stationIndex: 2, title: "RNTL." },
    "rntl.": { stationIndex: 2, title: "RNTL." },
    "sinskari": { stationIndex: 3, title: "Sinskari" },
    "dramsoc srcc": { stationIndex: 4, title: "Dramsoc SRCC" },
    "dramsoc": { stationIndex: 4, title: "Dramsoc SRCC" },
    "jio hotstar": { stationIndex: 5, title: "Jio Hotstar" },
    "delhi metro": { stationIndex: 6, title: "Delhi Metro Transit Line" },
    "delhi metro transit": { stationIndex: 6, title: "Delhi Metro Transit Line" },
    "delhi metro transit line": { stationIndex: 6, title: "Delhi Metro Transit Line" },
});

