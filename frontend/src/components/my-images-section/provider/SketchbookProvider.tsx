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
import { sketchbookService } from "@/api";

interface SketchbookContextType {
    // State
    pages: SketchbookPage[];
    currentPageIndex: number;
    currentPage: SketchbookPage | undefined;
    typography: SketchbookTypography;
    metadata: SketchbookMetadata;
    activePaletteId: string;
    activePalette: ColorPalette;
    isControlsOpen: boolean;
    isImageManagerOpen: boolean;
    isIndexDrawerOpen: boolean;
    generatedSrcDoc: string | undefined;
    isHydrated: boolean;

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

const STORAGE_KEY_PAGES = "sketchbook_pages_v5";
const STORAGE_KEY_TYPOGRAPHY = "sketchbook_typography_v5";
const STORAGE_KEY_METADATA = "sketchbook_metadata_v5";

export function SketchbookProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Pages state (deterministic defaults for SSR and hydration)
    const [pages, setPages] = useState<SketchbookPage[]>(INITIAL_SKETCHBOOK_PAGES);

    // 2. Typography state
    const [typography, setTypography] = useState<SketchbookTypography>(DEFAULT_SKETCHBOOK_TYPOGRAPHY);

    // 3. Metadata state
    const [metadata, setMetadata] = useState<SketchbookMetadata>(DEFAULT_SKETCHBOOK_METADATA);

    const [isHydrated, setIsHydrated] = useState<boolean>(false);
    const [activePaletteId, setActivePaletteId] = useState<string>("classic-ink");
    const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
    const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
    const [isImageManagerOpen, setIsImageManagerOpen] = useState<boolean>(false);
    const [isIndexDrawerOpen, setIsIndexDrawerOpen] = useState<boolean>(false);

    const frameRef = useRef<HTMLIFrameElement | null>(null);

    // Restore saved settings from localStorage after client hydration
    useEffect(() => {
        setIsHydrated(true);
        try {
            const savedPages = localStorage.getItem(STORAGE_KEY_PAGES);
            if (savedPages) {
                const parsed = JSON.parse(savedPages);
                if (
                    Array.isArray(parsed) &&
                    parsed.length > 0 &&
                    !parsed.some((p: any) => typeof p.file === "string" && p.file.startsWith("spread-"))
                ) {
                    setPages(parsed);
                }
            }
        } catch {
            // ignore JSON or access error
        }

        try {
            const savedTypo = localStorage.getItem(STORAGE_KEY_TYPOGRAPHY);
            if (savedTypo) {
                setTypography({
                    ...DEFAULT_SKETCHBOOK_TYPOGRAPHY,
                    ...JSON.parse(savedTypo),
                });
            }
        } catch {
            // ignore
        }

        try {
            const savedMeta = localStorage.getItem(STORAGE_KEY_METADATA);
            if (savedMeta) {
                setMetadata({
                    ...DEFAULT_SKETCHBOOK_METADATA,
                    ...JSON.parse(savedMeta),
                });
            }
        } catch {
            // ignore
        }
    }, []);

    // Fetch curated plates from backend API (max 10)
    useEffect(() => {
        let isCancelled = false;
        const loadPlates = async () => {
            try {
                const res = await sketchbookService.getImages();
                if (isCancelled) return;
                const rawList = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                      ? res.data
                      : [];
                if (rawList.length > 0) {
                    const mapped = rawList.map((item: any, idx: number) => {
                        const fileUrl =
                            item.image_url ||
                            item.imageUrl ||
                            item.file ||
                            item.url ||
                            "";
                        const thumb =
                            item.thumbnail_url ||
                            item.thumbnailUrl ||
                            fileUrl;
                        return {
                            id: item.id || `custom-plate-${idx}`,
                            file: fileUrl,
                            title: item.title || `Plate ${idx + 1}`,
                            place: item.place || "",
                            description: item.description || "",
                            thumbnailUrl: thumb,
                            isCustom: true,
                        };
                    });
                    setPages(mapped);

                    // Push directly to live iframe if already mounted
                    try {
                        const win = frameRef.current?.contentWindow as any;
                        if (win && typeof win.setPages === "function") {
                            win.setPages(mapped);
                        }
                    } catch {
                        // ignore
                    }
                }
            } catch (err) {
                console.log("Using initial fallback plates:", err);
            }
        };
        loadPlates();
        return () => { isCancelled = true; };
    }, []);

    // Save to localStorage safely only after client hydration
    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
        } catch {
            // ignore storage quota errors for large base64 images
        }
    }, [pages, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(
                STORAGE_KEY_TYPOGRAPHY,
                JSON.stringify(typography),
            );
        } catch {
            // ignore
        }
    }, [typography, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        try {
            localStorage.setItem(
                STORAGE_KEY_METADATA,
                JSON.stringify(metadata),
            );
        } catch {
            // ignore
        }
    }, [metadata, isHydrated]);

    // Active palette resolved and scoped cleanly to the section (no global document mutation)
    const activePalette = useMemo(() => {
        return (
            COLOR_PALETTES.find((p) => p.id === activePaletteId) ||
            COLOR_PALETTES[0]
        );
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

    // Generated srcDoc disabled in favor of native live window.setPages sync
    const generatedSrcDoc = undefined;

    // Keep live iframe synchronized when pages change
    useEffect(() => {
        try {
            const win = frameRef.current?.contentWindow as any;
            if (win && typeof win.setPages === "function" && pages.length > 0) {
                win.setPages(pages);
            }
        } catch {
            // ignore
        }
    }, [pages]);

    // Listen for page changes from inside the iframe (clicks, taps, flips)
    useEffect(() => {
        const handlePageMsg = (e: MessageEvent) => {
            if (e.data?.type === "SKETCHBOOK_PAGE_CHANGED" && typeof e.data.pageIndex === "number") {
                setCurrentPageIndex(e.data.pageIndex);
            }
        };
        window.addEventListener("message", handlePageMsg);
        return () => window.removeEventListener("message", handlePageMsg);
    }, []);

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
        activePalette,
        isControlsOpen,
        isImageManagerOpen,
        isIndexDrawerOpen,
        generatedSrcDoc,
        isHydrated,
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
