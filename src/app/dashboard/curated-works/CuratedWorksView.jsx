"use client";

import React from "react";
import { CuratedWorksProvider } from "./provider/CuratedWorksProvider";
import CuratedWorksHeader from "./components/CuratedWorksHeader";
import CapacityBar from "./components/CapacityBar";
import PlateUploadForm from "./components/PlateUploadForm";
import PlatesList from "./components/PlatesList";
import PlateDeleteModal from "./components/PlateDeleteModal";

function CuratedWorksInnerView() {
    return (
        <div className="space-y-6">
            <CuratedWorksHeader />
            <CapacityBar />
            <PlateUploadForm />
            <PlatesList />
            <PlateDeleteModal />
        </div>
    );
}

export default function CuratedWorksView() {
    return (
        <CuratedWorksProvider>
            <CuratedWorksInnerView />
        </CuratedWorksProvider>
    );
}

