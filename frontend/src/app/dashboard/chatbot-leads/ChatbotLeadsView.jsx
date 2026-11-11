"use client";

import React from "react";
import { ChatbotLeadsProvider } from "./provider/ChatbotLeadsProvider";
import ChatbotLeadsHeader from "./components/ChatbotLeadsHeader";
import LeadOverviewCards from "./components/LeadOverviewCards";
import LeadFiltersBar from "./components/LeadFiltersBar";
import LeadTable from "./components/LeadTable";
import LeadDetailsDrawer from "./components/LeadDetailsDrawer";
import LeadDeleteModal from "./components/LeadDeleteModal";

function ChatbotLeadsInnerView() {
    return (
        <div className="space-y-4">
            <ChatbotLeadsHeader />
            <LeadOverviewCards />
            <LeadFiltersBar />
            <LeadTable />
            <LeadDetailsDrawer />
            <LeadDeleteModal />
        </div>
    );
}

export default function ChatbotLeadsView() {
    return (
        <ChatbotLeadsProvider>
            <ChatbotLeadsInnerView />
        </ChatbotLeadsProvider>
    );
}

