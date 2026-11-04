"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  INITIAL_ARTICLE_STATE,
  INITIAL_SECTION_STATE,
  calculateReadingTime,
  generateSlug,
  FORM_STEPS,
} from "../config/blogFormConfig";
import BlogServices from "@/api/services/blog.services";

const BlogFormContext = createContext(null);

export const STORAGE_KEY_ARTICLES = "studio_articles";
export const STORAGE_KEY_DRAFT_PREFIX = "studio_blog_draft_";

export function BlogFormProvider({ children, initialEditId = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editParam = initialEditId || (searchParams ? searchParams.get("edit") : null);
  const slugParam = searchParams ? searchParams.get("slug") : null;

  const [formData, setFormData] = useState(() => ({
    ...INITIAL_ARTICLE_STATE,
    id: `art-${Date.now().toString(36)}`,
  }));

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Show transient toast
  const showToast = useCallback((msg, type = "info") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Helper to get stored articles (local safety storage)
  const getAllStoredArticles = useCallback(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ARTICLES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch (err) {
      console.error("Failed to read stored articles:", err);
      return [];
    }
  }, []);

  // Initialize or Load article for editing
  useEffect(() => {
    if (isInitialized) return;

    let isMounted = true;

    async function loadArticleData() {
      // 1. Try loading from Backend API first if edit or slug param is present
      if (editParam || slugParam) {
        const targetKey = editParam || slugParam;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetKey);

        try {
          let res = null;
          if (isUuid) {
            res = await BlogServices.getBlogById(targetKey);
          } else {
            res = await BlogServices.getBlogBySlug(targetKey);
          }

          if (res?.data && isMounted) {
            const art = res.data;
            setFormData({
              ...INITIAL_ARTICLE_STATE,
              ...art,
              introduction: Array.isArray(art.introduction)
                ? art.introduction
                : art.introduction
                ? [art.introduction]
                : [""],
              sections: Array.isArray(art.sections) ? art.sections : [],
              tags: Array.isArray(art.tags) ? art.tags : [],
            });
            showToast(`Loaded "${art.title}" from API.`, "success");
            setIsInitialized(true);
            return;
          }
        } catch (apiErr) {
          console.warn("API load failed, checking fallback:", apiErr.message);
        }
      }

      // 2. Fallback to local storage or clean template
      if (!isMounted) return;
      const allArticles = getAllStoredArticles();
      let target = null;

      if (editParam) {
        target = allArticles.find((a) => a.id === editParam || a.slug === editParam);
      } else if (slugParam) {
        target = allArticles.find((a) => a.slug === slugParam);
      }

      if (target) {
        setFormData(JSON.parse(JSON.stringify(target)));
        showToast(`Loaded article "${target.title}" for editing.`, "success");
      } else {
        // Start completely fresh with zero pre-filled values
        setFormData({
          ...INITIAL_ARTICLE_STATE,
          id: `art-${Date.now().toString(36)}`,
        });
        try {
          localStorage.removeItem(`${STORAGE_KEY_DRAFT_PREFIX}active`);
        } catch (e) {
          // ignore
        }
      }

      setIsInitialized(true);
    }

    loadArticleData();

    return () => {
      isMounted = false;
    };
  }, [editParam, slugParam, isInitialized, getAllStoredArticles, showToast]);

  // Autosave working draft to localStorage periodically
  useEffect(() => {
    if (!isInitialized || !isDirty) return;

    const timeout = setTimeout(() => {
      try {
        const key = formData.id
          ? `${STORAGE_KEY_DRAFT_PREFIX}${formData.id}`
          : `${STORAGE_KEY_DRAFT_PREFIX}active`;
        localStorage.setItem(key, JSON.stringify(formData));
        setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        console.warn("Autosave draft failed:", err);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [formData, isDirty, isInitialized]);

  // Root field updater
  const updateField = useCallback((field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-update reading time if title, excerpt or introduction changes
      if (["title", "excerpt", "introduction"].includes(field)) {
        next.readingTime = calculateReadingTime(next);
      }

      // If title changes, keep slug, canonical URL and seoTitle in sync if not manually detached
      if (field === "title") {
        const genSlug = generateSlug(value);
        const wasAutoSlug = !prev.slug || prev.slug === generateSlug(prev.title);
        if (wasAutoSlug) {
          next.slug = genSlug;
        }

        const wasAutoSeoTitle = !prev.seoTitle || prev.seoTitle === (prev.title ? `${prev.title} | Anup Rawat` : "");
        if (wasAutoSeoTitle) {
          next.seoTitle = value ? `${value} | Anup Rawat` : "";
        }

        const activeSlug = wasAutoSlug ? genSlug : (next.slug || genSlug);
        const wasAutoCanonical =
          !prev.canonicalUrl ||
          prev.canonicalUrl.endsWith(`/blog/${generateSlug(prev.title)}`) ||
          prev.canonicalUrl.endsWith(`/blog/${prev.slug}`);
        if (wasAutoCanonical && activeSlug) {
          next.canonicalUrl = `https://anuprawat.com/blog/${activeSlug}`;
        }
      }

      // If slug changes directly, keep canonical updated if it was auto-synced
      if (field === "slug") {
        const wasAutoCanonical =
          !prev.canonicalUrl ||
          prev.canonicalUrl.endsWith(`/blog/${prev.slug}`) ||
          prev.canonicalUrl.endsWith(`/blog/${generateSlug(prev.title)}`);
        if (wasAutoCanonical && value) {
          next.canonicalUrl = `https://anuprawat.com/blog/${value}`;
        }
      }

      // If excerpt changes, auto update seoDescription if matching previous excerpt
      if (field === "excerpt") {
        const wasAutoSeoDesc = !prev.seoDescription || prev.seoDescription === prev.excerpt;
        if (wasAutoSeoDesc) {
          next.seoDescription = value;
        }
      }

      return next;
    });
    setIsDirty(true);
    // Clear field-level error
    setErrors((prev) => {
      if (prev[field]) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return prev;
    });
  }, []);

  // Author field updater
  const updateAuthor = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      author: {
        ...(prev.author || { name: "", role: "" }),
        [field]: value,
      },
    }));
    setIsDirty(true);
  }, []);

  // Auto-generate URL slug from current title
  const autoGenerateSlug = useCallback(() => {
    if (!formData.title) return;
    const slug = generateSlug(formData.title);
    updateField("slug", slug);
    updateField("canonicalUrl", `https://anuprawat.com/blog/${slug}`);
    if (!formData.seoTitle) {
      updateField("seoTitle", `${formData.title} | Anup Rawat`);
    }
  }, [formData.title, formData.seoTitle, updateField]);

  // Recalculate reading time explicitly
  const autoCalculateReadTime = useCallback(() => {
    const time = calculateReadingTime(formData);
    updateField("readingTime", time);
    showToast(`Calculated reading time: ${time}`, "info");
  }, [formData, updateField, showToast]);

  // Tags management
  const addTag = useCallback((newTag) => {
    const trimmed = (newTag || "").trim().toLowerCase();
    if (!trimmed) return;
    setFormData((prev) => {
      const existing = prev.tags || [];
      if (existing.includes(trimmed)) return prev;
      return { ...prev, tags: [...existing, trimmed] };
    });
    setIsDirty(true);
  }, []);

  const removeTag = useCallback((tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
    setIsDirty(true);
  }, []);

  // Introduction paragraphs management
  const addIntroParagraph = useCallback(() => {
    setFormData((prev) => {
      const nextIntro = [...(prev.introduction || []), ""];
      const next = { ...prev, introduction: nextIntro };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  const updateIntroParagraph = useCallback((index, value) => {
    setFormData((prev) => {
      const nextIntro = [...(prev.introduction || [])];
      nextIntro[index] = value;
      const next = { ...prev, introduction: nextIntro };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  const removeIntroParagraph = useCallback((index) => {
    setFormData((prev) => {
      const nextIntro = (prev.introduction || []).filter((_, i) => i !== index);
      const next = { ...prev, introduction: nextIntro.length ? nextIntro : [""] };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  // Sections management
  const addSection = useCallback(() => {
    setFormData((prev) => {
      const newSec = {
        ...INITIAL_SECTION_STATE,
        id: `section-${(prev.sections?.length || 0) + 1}-${Date.now().toString(36)}`,
        heading: `New Technical Section ${(prev.sections?.length || 0) + 1}`,
      };
      const next = { ...prev, sections: [...(prev.sections || []), newSec] };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
    showToast("Added new article section block.", "info");
  }, [showToast]);

  const removeSection = useCallback((index) => {
    setFormData((prev) => {
      const nextSections = (prev.sections || []).filter((_, i) => i !== index);
      const next = { ...prev, sections: nextSections };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  const moveSection = useCallback((index, direction) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const [moved] = list.splice(index, 1);
      list.splice(targetIndex, 0, moved);
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const updateSection = useCallback((index, field, value) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      if (!list[index]) return prev;
      list[index] = { ...list[index], [field]: value };
      const next = { ...prev, sections: list };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  // Section Paragraphs
  const addSectionParagraph = useCallback((sectionIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      if (!list[sectionIndex]) return prev;
      const paras = [...(list[sectionIndex].paragraphs || []), ""];
      list[sectionIndex] = { ...list[sectionIndex], paragraphs: paras };
      const next = { ...prev, sections: list };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  const updateSectionParagraph = useCallback((sectionIndex, pIndex, val) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      if (!list[sectionIndex]) return prev;
      const paras = [...(list[sectionIndex].paragraphs || [])];
      paras[pIndex] = val;
      list[sectionIndex] = { ...list[sectionIndex], paragraphs: paras };
      const next = { ...prev, sections: list };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  const removeSectionParagraph = useCallback((sectionIndex, pIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      if (!list[sectionIndex]) return prev;
      const paras = (list[sectionIndex].paragraphs || []).filter((_, i) => i !== pIndex);
      list[sectionIndex] = { ...list[sectionIndex], paragraphs: paras.length ? paras : [""] };
      const next = { ...prev, sections: list };
      next.readingTime = calculateReadingTime(next);
      return next;
    });
    setIsDirty(true);
  }, []);

  // Subsections (H3)
  const addSubSection = useCallback((sectionIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      if (!list[sectionIndex]) return prev;
      const subs = [
        ...(list[sectionIndex].subSections || []),
        { title: "New Subsection", paragraphs: [""] },
      ];
      list[sectionIndex] = { ...list[sectionIndex], subSections: subs };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const updateSubSection = useCallback((sectionIndex, subIndex, field, value) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      if (!list[sectionIndex] || !list[sectionIndex].subSections?.[subIndex]) return prev;
      const subs = [...list[sectionIndex].subSections];
      subs[subIndex] = { ...subs[subIndex], [field]: value };
      list[sectionIndex] = { ...list[sectionIndex], subSections: subs };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const removeSubSection = useCallback((sectionIndex, subIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      if (!list[sectionIndex]) return prev;
      const subs = (list[sectionIndex].subSections || []).filter((_, i) => i !== subIndex);
      list[sectionIndex] = { ...list[sectionIndex], subSections: subs };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  // Toggle optional rich blocks (pullQuote, inlineImage, table, checklist)
  const toggleBlock = useCallback((sectionIndex, blockType) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec) return prev;

      if (sec[blockType]) {
        // remove
        list[sectionIndex] = { ...sec, [blockType]: null };
      } else {
        // initialize with defaults
        let defaultBlock = null;
        if (blockType === "pullQuote") {
          defaultBlock = { text: "Quote highlighting pivotal technique or philosophy.", context: "Director of Photography Note" };
        } else if (blockType === "inlineImage") {
          defaultBlock = { src: "/images/lighting-emotion-shadows.svg", alt: "Technical lighting diagram", caption: "Figure 1.1: Raytraced incident light vector and boundary shadow falloff." };
        } else if (blockType === "table") {
          defaultBlock = {
            caption: "LIGHTING PARAMETER & RATIO SPECIFICATION",
            headers: ["Setup Key", "Fixture", "Diffusion / Mod", "Ratio / Stop"],
            rows: [
              ["Key Light", "ARRI M18 HMI", "6x6 1/2 Silent Grid", "T4.0"],
              ["Negative Fill", "Solid Black Duvetyne", "8x8 Overhead", "—"],
            ],
          };
        } else if (blockType === "checklist") {
          defaultBlock = [
            "Inspect lens front element and mount for dust or flare resistance",
            "Set wireless video monitor LUT calibration to Rec.709 standard",
          ];
        }
        list[sectionIndex] = { ...sec, [blockType]: defaultBlock };
      }
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  // PullQuote updates
  const updatePullQuote = useCallback((sectionIndex, field, value) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec) return prev;
      const current = sec.pullQuote || { text: "", context: "" };
      list[sectionIndex] = {
        ...sec,
        pullQuote: { ...current, [field]: value },
      };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  // InlineImage updates
  const updateInlineImage = useCallback((sectionIndex, field, value) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec) return prev;
      const current = sec.inlineImage || { src: "", alt: "", caption: "" };
      list[sectionIndex] = {
        ...sec,
        inlineImage: { ...current, [field]: value },
      };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  // Table updates
  const updateTableCaption = useCallback((sectionIndex, caption) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.table) return prev;
      list[sectionIndex] = { ...sec, table: { ...sec.table, caption } };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const updateTableHeader = useCallback((sectionIndex, headerIndex, value) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.table) return prev;
      const headers = [...(sec.table.headers || [])];
      headers[headerIndex] = value;
      list[sectionIndex] = { ...sec, table: { ...sec.table, headers } };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const addTableColumn = useCallback((sectionIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.table) return prev;
      const headers = [...(sec.table.headers || []), `Column ${(sec.table.headers || []).length + 1}`];
      const rows = (sec.table.rows || []).map((r) => [...r, ""]);
      list[sectionIndex] = { ...sec, table: { ...sec.table, headers, rows } };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const removeTableColumn = useCallback((sectionIndex, colIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.table || (sec.table.headers || []).length <= 1) return prev;
      const headers = sec.table.headers.filter((_, i) => i !== colIndex);
      const rows = (sec.table.rows || []).map((r) => r.filter((_, i) => i !== colIndex));
      list[sectionIndex] = { ...sec, table: { ...sec.table, headers, rows } };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const updateTableCell = useCallback((sectionIndex, rowIndex, colIndex, value) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.table) return prev;
      const rows = (sec.table.rows || []).map((r, rI) => {
        if (rI !== rowIndex) return r;
        const newRow = [...r];
        newRow[colIndex] = value;
        return newRow;
      });
      list[sectionIndex] = { ...sec, table: { ...sec.table, rows } };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const addTableRow = useCallback((sectionIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.table) return prev;
      const colCount = (sec.table.headers || []).length || 2;
      const newRow = new Array(colCount).fill("");
      const rows = [...(sec.table.rows || []), newRow];
      list[sectionIndex] = { ...sec, table: { ...sec.table, rows } };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const removeTableRow = useCallback((sectionIndex, rowIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.table) return prev;
      const rows = (sec.table.rows || []).filter((_, i) => i !== rowIndex);
      list[sectionIndex] = { ...sec, table: { ...sec.table, rows } };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  // Checklist updates
  const addChecklistItem = useCallback((sectionIndex, text = "") => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec) return prev;
      const items = [...(sec.checklist || []), text || "New verification check point"];
      list[sectionIndex] = { ...sec, checklist: items };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const updateChecklistItem = useCallback((sectionIndex, itemIndex, value) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.checklist) return prev;
      const items = [...sec.checklist];
      items[itemIndex] = value;
      list[sectionIndex] = { ...sec, checklist: items };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  const removeChecklistItem = useCallback((sectionIndex, itemIndex) => {
    setFormData((prev) => {
      const list = [...(prev.sections || [])];
      const sec = list[sectionIndex];
      if (!sec || !sec.checklist) return prev;
      const items = sec.checklist.filter((_, i) => i !== itemIndex);
      list[sectionIndex] = { ...sec, checklist: items };
      return { ...prev, sections: list };
    });
    setIsDirty(true);
  }, []);

  // Validation
  const validateStep = useCallback(
    (stepNum) => {
      const newErrors = {};

      if (stepNum === 1) {
        if (!formData.title?.trim()) newErrors.title = "Article title is required.";
        if (!formData.slug?.trim()) newErrors.slug = "URL slug is required.";
        if (!formData.excerpt?.trim()) newErrors.excerpt = "Editorial excerpt is required.";
        if (!formData.category?.trim()) newErrors.category = "Please enter a category.";
        if (!formData.author?.name?.trim()) newErrors.authorName = "Author name is required.";
      } else if (stepNum === 2) {
        if (!formData.featuredImage?.trim() && (!formData.galleryImages || formData.galleryImages.length === 0)) {
          newErrors.featuredImage = "Please upload at least one image.";
        }
        if (!formData.featuredImageAlt?.trim()) newErrors.featuredImageAlt = "Descriptive alt text is required.";
      } else if (stepNum === 3) {
        if (!formData.content?.trim() && (!formData.sections || formData.sections.length === 0)) {
          newErrors.sections = "Please write content for your article.";
        }
      } else if (stepNum === 4) {
        if (!formData.seoTitle?.trim()) newErrors.seoTitle = "SEO title is recommended for indexing.";
        if (!formData.seoDescription?.trim()) newErrors.seoDescription = "Meta description is recommended.";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  // Stepper navigation
  const goToStep = useCallback(
    (stepNum) => {
      if (stepNum < 1 || stepNum > FORM_STEPS.length) return;
      // Allow going backward freely; validate when advancing forward
      if (stepNum > currentStep) {
        const isValid = validateStep(currentStep);
        if (!isValid) {
          showToast("Please resolve highlighted requirements before advancing.", "error");
          return;
        }
      }
      setCurrentStep(stepNum);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep, validateStep, showToast]
  );

  const nextStep = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  // Save / Publish logic via Backend API
  const saveArticle = useCallback(
    async (statusOverride = null) => {
      setIsSaving(true);

      try {
        const finalStatus = statusOverride || formData.status || "published";
        const effectiveSlug = formData.slug || generateSlug(formData.title) || "untitled-article";
        const finalArticle = {
          ...formData,
          status: finalStatus,
          updatedAt: new Date().toISOString().split("T")[0],
          readingTime: calculateReadingTime(formData),
          slug: effectiveSlug,
          seoTitle: formData.seoTitle || (formData.title ? `${formData.title} | Anup Rawat` : "Journal | Anup Rawat"),
          seoDescription: formData.seoDescription || formData.excerpt || "",
          seoKeywords: formData.seoKeywords || (formData.tags || []).join(", "),
          canonicalUrl: formData.canonicalUrl || `https://anuprawat.com/blog/${effectiveSlug}`,
          publishedAt:
            finalStatus === "published"
              ? formData.publishedAt || new Date().toISOString().split("T")[0]
              : formData.publishedAt,
        };

        // Call Backend Server REST API
        let apiSuccess = false;
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalArticle.id);
          if (isUuid) {
            const apiRes = await BlogServices.updateBlog(finalArticle.id, finalArticle);
            if (apiRes?.data) {
              Object.assign(finalArticle, apiRes.data);
            }
            apiSuccess = true;
          } else {
            const { id: _, ...createPayload } = finalArticle;
            const apiRes = await BlogServices.createBlog(createPayload);
            if (apiRes?.data?.id) {
              finalArticle.id = apiRes.data.id;
            }
            apiSuccess = true;
          }
        } catch (apiErr) {
          const errMsg = apiErr.response?.data?.message || apiErr.message;
          console.warn("Backend blog API save notice:", errMsg);
          showToast(`API notice: ${errMsg}`, "error");
          setIsSaving(false);
          return null;
        }

        // Clean up temporary active draft keys
        try {
          localStorage.removeItem(`${STORAGE_KEY_DRAFT_PREFIX}active`);
          if (finalArticle.id) {
            localStorage.removeItem(`${STORAGE_KEY_DRAFT_PREFIX}${finalArticle.id}`);
          }
        } catch (e) {
          // ignore
        }

        // Notify other windows/tabs or listeners to refresh the articles list
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("studio_articles_updated"));
        }

        showToast(
          finalStatus === "published"
            ? `Article "${finalArticle.title}" published live successfully!`
            : `Draft "${finalArticle.title}" saved successfully!`,
          "success"
        );

        // Reset the form so it is completely fresh and empty
        setFormData({
          ...INITIAL_ARTICLE_STATE,
          id: `art-${Date.now().toString(36)}`,
        });
        setCurrentStep(1);
        setErrors({});
        setIsDirty(false);

        // Navigate to the All Blogs section
        router.push("/dashboard/blogs");

        return finalArticle;
      } catch (err) {
        console.error("Save article failed:", err);
        showToast(`Failed to save article: ${err.message}`, "error");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [formData, router, showToast]
  );

  // Load a complete sample template
  const loadTemplate = useCallback((templateData) => {
    if (!templateData) return;
    setFormData({
      ...INITIAL_ARTICLE_STATE,
      ...templateData,
      id: `art-${Date.now().toString(36)}`,
      publishedAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    });
    setIsDirty(true);
    showToast("Loaded starter article template.", "info");
  }, [showToast]);

  // Reset form
  const resetForm = useCallback(() => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_DRAFT_PREFIX}active`);
    } catch (e) {
      // ignore
    }
    setFormData({
      ...INITIAL_ARTICLE_STATE,
      id: `art-${Date.now().toString(36)}`,
    });
    setCurrentStep(1);
    setErrors({});
    setIsDirty(false);
    showToast("Form cleared to clean empty template.", "info");
  }, [showToast]);

  const value = {
    formData,
    currentStep,
    errors,
    isDirty,
    isSaving,
    lastSaved,
    toastMessage,
    updateField,
    updateAuthor,
    autoGenerateSlug,
    autoCalculateReadTime,
    addTag,
    removeTag,
    addIntroParagraph,
    updateIntroParagraph,
    removeIntroParagraph,
    addSection,
    removeSection,
    moveSection,
    updateSection,
    addSectionParagraph,
    updateSectionParagraph,
    removeSectionParagraph,
    addSubSection,
    updateSubSection,
    removeSubSection,
    toggleBlock,
    updatePullQuote,
    updateInlineImage,
    updateTableCaption,
    updateTableHeader,
    addTableColumn,
    removeTableColumn,
    updateTableCell,
    addTableRow,
    removeTableRow,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
    validateStep,
    goToStep,
    nextStep,
    prevStep,
    saveArticle,
    loadTemplate,
    resetForm,
    showToast,
  };

  return (
    <BlogFormContext.Provider value={value}>
      {children}
    </BlogFormContext.Provider>
  );
}

export function useBlogForm() {
  const context = useContext(BlogFormContext);
  if (!context) {
    throw new Error("useBlogForm must be used within a BlogFormProvider");
  }
  return context;
}

