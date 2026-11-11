"use client";

import React from "react";
import { PortfolioKnowledgeProvider } from "./provider/PortfolioKnowledgeProvider";
import KnowledgeHeader from "./components/KnowledgeHeader";
import KnowledgeOverviewCards from "./components/KnowledgeOverviewCards";
import KnowledgeFiltersBar from "./components/KnowledgeFiltersBar";
import KnowledgeTable from "./components/KnowledgeTable";
import KnowledgeFormModal from "./components/KnowledgeFormModal";
import KnowledgeDeleteModal from "./components/KnowledgeDeleteModal";
import KnowledgeSearchTestModal from "./components/KnowledgeSearchTestModal";

function PortfolioKnowledgeInnerView() {
    return (
        <div className="space-y-6">
            <KnowledgeHeader />
            <KnowledgeOverviewCards />
            <KnowledgeFiltersBar />
            <KnowledgeTable />
            <KnowledgeFormModal />
            <KnowledgeDeleteModal />
            <KnowledgeSearchTestModal />
        </div>
    );
}

export default function PortfolioKnowledgeView() {
    return (
        <PortfolioKnowledgeProvider>
            <PortfolioKnowledgeInnerView />
        </PortfolioKnowledgeProvider>
    );
}

