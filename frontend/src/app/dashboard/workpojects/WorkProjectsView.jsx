"use client";

import React from "react";
import { WorkProjectsProvider } from "./provider/WorkProjectsProvider";
import WorkProjectsHeader from "./components/WorkProjectsHeader";
import WorkProjectsUploadForm from "./components/WorkProjectsUploadForm";
import WorkProjectsList from "./components/WorkProjectsList";
import WorkProjectEditModal from "./components/WorkProjectEditModal";
import WorkProjectDeleteModal from "./components/WorkProjectDeleteModal";

function WorkProjectsInnerView() {
    return (
        <div className="space-y-6">
            <WorkProjectsHeader />
            <WorkProjectsUploadForm />
            <WorkProjectsList />
            <WorkProjectEditModal />
            <WorkProjectDeleteModal />
        </div>
    );
}

export default function WorkProjectsView() {
    return (
        <WorkProjectsProvider>
            <WorkProjectsInnerView />
        </WorkProjectsProvider>
    );
}

