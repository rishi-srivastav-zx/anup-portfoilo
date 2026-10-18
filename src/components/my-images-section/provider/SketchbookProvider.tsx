"use client";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    COLOR_PALETTES,
    DEFAULT_SKETCHBOOK_METADATA,
    DEFAULT_SKETCHBOOK_TYPOGRAPHY,
    INITIAL_SKETCHBOOK_PAGES,
    type ColorPalette,
    type SketchbookMetadata,
    type SketchbookPage,
    type SketchbookTypography,
} from "../config/sketchbook.config";

interface SketchbookContextType {
    // State
    pages: SketchbookPage[];
    currentPageIndex: number;
    currentPage: SketchbookPage | undefined;
    typography: SketchbookTypography;
    metadata: SketchbookMetadata;
    activePaletteId: string;
    isControlsOpen: boolean;
    isImageManagerOpen: boolean;
    isIndexDrawerOpen: boolean;
    generatedSrcDoc: string | undefined;

    // Navigation
    goToPage: (index: number) => void;
    nextPage: () => void;
    prevPage: () => void;

    // Page Management
    addPage: (page: Omit<SketchbookPage, "id">) => string;
    removePage: (id: string) => void;
    updatePage: (id: string, updates: Partial<SketchbookPage>) => void;
    reorderPages: (fromIndex: number, toIndex: number) => void;
    resetToDefaults: () => void;

    // Styling & Metadata
    updateTypography: (updates: Partial<SketchbookTypography>) => void;
    updateMetadata: (updates: Partial<SketchbookMetadata>) => void;
    applyPalette: (paletteId: string) => void;

    // UI Modal Toggles
    setIsControlsOpen: (open: boolean) => void;
    setIsImageManagerOpen: (open: boolean) => void;
    setIsIndexDrawerOpen: (open: boolean) => void;
    toggleControls: () => void;
    toggleImageManager: () => void;
    toggleIndexDrawer: () => void;

    // Iframe registration
    registerFrame: (frame: HTMLIFrameElement | null) => void;
}

const SketchbookContext = createContext<SketchbookContextType | null>(null);

const STORAGE_KEY_PAGES = "sketchbook_pages_v1";
const STORAGE_KEY_TYPOGRAPHY = "sketchbook_typography_v1";
const STORAGE_KEY_METADATA = "sketchbook_metadata_v1";

export function SketchbookProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Pages state
    const [pages, setPages] = useState<SketchbookPage[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_PAGES);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {
            // ignore
        }
        return INITIAL_SKETCHBOOK_PAGES;
    });

    // 2. Typography state
    const [typography, setTypography] = useState<SketchbookTypography>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_TYPOGRAPHY);
            if (saved)
                return {
                    ...DEFAULT_SKETCHBOOK_TYPOGRAPHY,
                    ...JSON.parse(saved),
                };
        } catch {
            // ignore
        }
        return DEFAULT_SKETCHBOOK_TYPOGRAPHY;
    });

    // 3. Metadata state
    const [metadata, setMetadata] = useState<SketchbookMetadata>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_METADATA);
            if (saved)
                return { ...DEFAULT_SKETCHBOOK_METADATA, ...JSON.parse(saved) };
        } catch {
            // ignore
        }
        return DEFAULT_SKETCHBOOK_METADATA;
    });

    const [activePaletteId, setActivePaletteId] =
        useState<string>("classic-ink");
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
    const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
    const [isImageManagerOpen, setIsImageManagerOpen] =
        useState<boolean>(false);
    const [isIndexDrawerOpen, setIsIndexDrawerOpen] = useState<boolean>(false);

    // Template HTML fetched from public
    const [baseHtml, setBaseHtml] = useState<string>("");
    const frameRef = useRef<HTMLIFrameElement | null>(null);

    // Fetch base HTML template for dynamic page rewriting
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                let res = await fetch(
                    "/my-image-section/meng-to-sketchbook.html",
                );
                if (!res.ok) {
                    res = await fetch("/landing-pages/meng-to-sketchbook.html");
                }
                if (!res.ok) throw new Error("Failed to load sketchbook HTML");
                const text = await res.text();
                setBaseHtml(text);
            } catch (err) {
                console.warn(
                    "Could not prefetch sketchbook HTML template:",
                    err,
                );
            }
        };
        fetchTemplate();
    }, []);

    // Save to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
        } catch {
            // ignore storage quota errors for large base64 images
        }
    }, [pages]);

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY_TYPOGRAPHY,
                JSON.stringify(typography),
            );
        } catch {
            // ignore
        }
    }, [typography]);

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY_METADATA,
                JSON.stringify(metadata),
            );
        } catch {
            // ignore
        }
    }, [metadata]);

    // Sync background color with active palette
    useEffect(() => {
        const palette = COLOR_PALETTES.find((p) => p.id === activePaletteId);
        if (palette) {
            document.documentElement.style.backgroundColor = palette.paperColor;
            document.body.style.backgroundColor = palette.paperColor;
        }
    }, [activePaletteId]);

    // Determine if pages have been customized from the initial 9
    const isCustomizedPages = useMemo(() => {
        if (pages.length !== INITIAL_SKETCHBOOK_PAGES.length) return true;
        return pages.some((p, i) => {
            const orig = INITIAL_SKETCHBOOK_PAGES[i];
            return (
                !orig ||
                p.file !== orig.file ||
                p.title !== orig.title ||
                p.place !== orig.place
            );
        });
    }, [pages]);

    // Generate dynamic srcDoc if user added/modified pages
    const generatedSrcDoc = useMemo(() => {
        if (!isCustomizedPages || !baseHtml) return undefined;

        let html = baseHtml;

        // Inject base tag so relative assets resolve properly
        if (!html.includes("<base ")) {
            html = html.replace(
                "<head>",
                '<head><base href="/landing-pages/">',
            );
        }

        // Build replacement PAGES array with robust URL resolution (handles data URLs, full URLs, and local files)
        const formattedPages = pages.map((p) => ({
            file: p.file,
            title: p.title,
            place: p.place || "",
        }));

        const pagesCode = `const PAGES=${JSON.stringify(formattedPages)};\nPAGES.forEach(p=>p.url=(p.file.startsWith('http')||p.file.startsWith('/')||p.file.startsWith('data:'))?p.file:(DIR+p.file));`;

        const regex =
            /const PAGES=\[\s*[\s\S]*?\];\s*PAGES\.forEach\(p=>p\.url=DIR\+p\.file\);/;
        if (regex.test(html)) {
            html = html.replace(regex, pagesCode);
        }

        return html;
    }, [isCustomizedPages, baseHtml, pages]);

    // Frame registration
    const registerFrame = useCallback((frame: HTMLIFrameElement | null) => {
        frameRef.current = frame;
    }, []);

    // Navigation handlers
    const goToPage = useCallback(
        (index: number) => {
            if (index < 0 || index >= pages.length) return;
            setCurrentPageIndex(index);
            try {
                const win = frameRef.current?.contentWindow as any;
                if (win && typeof win.goTo === "function") {
                    win.goTo(index);
                }
            } catch {
                // cross-origin guard if any
            }
        },
        [pages.length],
    );

    const nextPage = useCallback(() => {
        goToPage((currentPageIndex + 1) % pages.length);
    }, [currentPageIndex, pages.length, goToPage]);

    const prevPage = useCallback(() => {
        goToPage((currentPageIndex - 1 + pages.length) % pages.length);
    }, [currentPageIndex, pages.length, goToPage]);

    // Page management
    const addPage = useCallback(
        (newPage: Omit<SketchbookPage, "id">) => {
            const id = "plate-" + Date.now();
            const created: SketchbookPage = {
                ...newPage,
                id,
                isCustom: true,
                thumbnailUrl: newPage.thumbnailUrl || newPage.file,
            };
            setPages((prev) => {
                const next = [...prev, created];
                return next;
            });
            // Navigate to the newly added page
            setTimeout(() => {
                setCurrentPageIndex(pages.length);
            }, 100);
            return id;
        },
        [pages.length],
    );

    const removePage = useCallback(
        (id: string) => {
            setPages((prev) => {
                if (prev.length <= 1) return prev; // Keep at least one page
                const next = prev.filter((p) => p.id !== id);
                return next;
            });
            setCurrentPageIndex((prev) =>
                Math.max(0, Math.min(prev, pages.length - 2)),
            );
        },
        [pages.length],
    );

    const updatePage = useCallback(
        (id: string, updates: Partial<SketchbookPage>) => {
            setPages((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
            );
        },
        [],
    );

    const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
        setPages((prev) => {
            if (
                fromIndex < 0 ||
                fromIndex >= prev.length ||
                toIndex < 0 ||
                toIndex >= prev.length
            ) {
                return prev;
            }
            const updated = [...prev];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            return updated;
        });
        setCurrentPageIndex(toIndex);
    }, []);

    const resetToDefaults = useCallback(() => {
        setPages(INITIAL_SKETCHBOOK_PAGES);
        setTypography(DEFAULT_SKETCHBOOK_TYPOGRAPHY);
        setMetadata(DEFAULT_SKETCHBOOK_METADATA);
        setActivePaletteId("classic-ink");
        setCurrentPageIndex(0);
        localStorage.removeItem(STORAGE_KEY_PAGES);
        localStorage.removeItem(STORAGE_KEY_TYPOGRAPHY);
        localStorage.removeItem(STORAGE_KEY_METADATA);
    }, []);

    const updateTypography = useCallback(
        (updates: Partial<SketchbookTypography>) => {
            setTypography((prev) => ({ ...prev, ...updates }));
        },
        [],
    );

    const updateMetadata = useCallback(
        (updates: Partial<SketchbookMetadata>) => {
            setMetadata((prev) => ({ ...prev, ...updates }));
        },
        [],
    );

    const applyPalette = useCallback((paletteId: string) => {
        const pal = COLOR_PALETTES.find((p) => p.id === paletteId);
        if (!pal) return;
        setActivePaletteId(paletteId);
        setTypography((prev) => ({
            ...prev,
            primaryColor: pal.color,
        }));
    }, []);

    const toggleControls = useCallback(() => setIsControlsOpen((v) => !v), []);
    const toggleImageManager = useCallback(
        () => setIsImageManagerOpen((v) => !v),
        [],
    );
    const toggleIndexDrawer = useCallback(
        () => setIsIndexDrawerOpen((v) => !v),
        [],
    );

    const currentPage = pages[currentPageIndex] || pages[0];

    const value = {
        pages,
        currentPageIndex,
        currentPage,
        typography,
        metadata,
        activePaletteId,
        isControlsOpen,
        isImageManagerOpen,
        isIndexDrawerOpen,
        generatedSrcDoc,
        goToPage,
        nextPage,
        prevPage,
        addPage,
        removePage,
        updatePage,
        reorderPages,
        resetToDefaults,
        updateTypography,
        updateMetadata,
        applyPalette,
        setIsControlsOpen,
        setIsImageManagerOpen,
        setIsIndexDrawerOpen,
        toggleControls,
        toggleImageManager,
        toggleIndexDrawer,
        registerFrame,
    };

    return (
        <SketchbookContext.Provider value={value}>
            {children}
        </SketchbookContext.Provider>
    );
}

export function useSketchbook() {
    const context = useContext(SketchbookContext);
    if (!context) {
        throw new Error(
            "useSketchbook must be used within a SketchbookProvider",
        );
    }
    return context;
}
