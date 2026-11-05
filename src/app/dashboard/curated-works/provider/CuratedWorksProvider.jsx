"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { sketchbookService } from "@/api";
import { MAX_PLATES, MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES } from "../config/curatedWorksConfig";

const CuratedWorksContext = createContext(null);

export function CuratedWorksProvider({ children }) {
    const [plates, setPlates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Form inputs for upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [title, setTitle] = useState("");
    const [place, setPlace] = useState("");
    const [description, setDescription] = useState("");

    // Delete Modal
    const [deleteModalItem, setDeleteModalItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fileInputRef = useRef(null);

    // API Call: Fetch Plates
    const fetchPlates = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        setErrorMsg(null);
        try {
            const res = await sketchbookService.getImages();
            if (res?.data) {
                setPlates(res.data);
            } else if (Array.isArray(res)) {
                setPlates(res);
            }
        } catch (err) {
            console.error("[CuratedWorksProvider] Failed to load plates:", err);
            setErrorMsg(
                err?.response?.data?.message || err.message || "Unable to load sketchbook plates."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlates();
    }, [fetchPlates]);

    // File selection
    const handleFileSelect = (file) => {
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            setErrorMsg("File exceeds the maximum 20MB limit.");
            return;
        }

        setSelectedFile(file);
        setErrorMsg(null);

        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);

        if (!title) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
            setTitle(nameWithoutExt);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // API Call: Upload Plate
    const handleSubmitPlate = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        if (!selectedFile) {
            setErrorMsg("Please choose an image file to upload.");
            return;
        }

        if (plates.length >= MAX_PLATES) {
            setErrorMsg(`Maximum limit of ${MAX_PLATES} plates reached. Delete an existing plate to upload a new one.`);
            return;
        }

        if (!title.trim()) {
            setErrorMsg("Please provide a title for this plate.");
            return;
        }

        setUploading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);
            formData.append("title", title.trim());
            if (place.trim()) formData.append("place", place.trim());
            if (description.trim()) formData.append("description", description.trim());

            const res = await sketchbookService.uploadImage(formData);
            if (res?.success || res?.data) {
                setSuccessMsg("Plate uploaded successfully and converted to optimized WebP!");
                clearSelectedFile();
                setTitle("");
                setPlace("");
                setDescription("");
                await fetchPlates(true);
                setTimeout(() => setSuccessMsg(null), 4000);
            }
        } catch (err) {
            console.error("[CuratedWorksProvider] Upload failed:", err);
            setErrorMsg(
                err?.response?.data?.message || err.message || "Plate upload failed. Please try again."
            );
        } finally {
            setUploading(false);
        }
    };

    // API Call: Delete Plate
    const handleOpenDeleteModal = (plate) => setDeleteModalItem(plate);
    const handleCloseDeleteModal = () => setDeleteModalItem(null);

    const handleConfirmDelete = async () => {
        if (!deleteModalItem) return;
        setDeleting(true);

        try {
            await sketchbookService.deleteImage(deleteModalItem.id);
            setPlates((prev) => prev.filter((p) => p.id !== deleteModalItem.id));
            setDeleteModalItem(null);
            setSuccessMsg("Plate deleted successfully.");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            console.error("[CuratedWorksProvider] Delete failed:", err);
            setErrorMsg(err?.response?.data?.message || "Failed to delete plate.");
        } finally {
            setDeleting(false);
        }
    };

    // API Call: Reorder Plates
    const handleMovePlate = async (index, direction) => {
        const newPlates = [...plates];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newPlates.length) return;

        const temp = newPlates[index];
        newPlates[index] = newPlates[targetIndex];
        newPlates[targetIndex] = temp;

        setPlates(newPlates);

        try {
            const orderedIds = newPlates.map((p) => p.id);
            await sketchbookService.reorderImages(orderedIds);
        } catch (err) {
            console.error("[CuratedWorksProvider] Reorder failed:", err);
            fetchPlates(true);
        }
    };

    const handleRefresh = () => fetchPlates(true);

    const value = {
        // State
        plates,
        loading,
        uploading,
        errorMsg,
        successMsg,
        selectedFile,
        filePreview,
        title,
        place,
        description,
        deleteModalItem,
        deleting,
        fileInputRef,

        // Setters / Handlers
        setTitle,
        setPlace,
        setDescription,
        setErrorMsg,
        setSuccessMsg,
        handleFileSelect,
        clearSelectedFile,
        handleSubmitPlate,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
        handleConfirmDelete,
        handleMovePlate,
        handleRefresh,
    };

    return (
        <CuratedWorksContext.Provider value={value}>
            {children}
        </CuratedWorksContext.Provider>
    );
}

export function useCuratedWorks() {
    const context = useContext(CuratedWorksContext);
    if (!context) {
        throw new Error("useCuratedWorks must be used within a CuratedWorksProvider");
    }
    return context;
}

