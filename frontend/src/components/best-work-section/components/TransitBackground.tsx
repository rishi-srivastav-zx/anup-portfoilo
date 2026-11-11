import React from "react";
import { SectionTitleBlock } from "./SectionTitleBlock";
import { RouteMapBoard } from "./RouteMapBoard";

export const TransitBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Blueprint Grid */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwaGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHYxSDB6bTAgNDBoNDB2MUgwek0wIDBoMXY0MEgwek0zOSAwaDF2NDBoLTF6IiBmaWxsPSJyZ2JhKDExLCAxMSwgMTEsIDAuMDUpIi8+PC9zdmc+')] opacity-[0.35] z-0" />

            {/* Route Line Overlay (Diagonal SVG Lines) */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhsOC04bTAtNEwtNCA4IiBzdHJva2U9IiMwQjBCMEIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-[0.015] z-0" />

            {/* Top Header Area ("Best Work") */}
            <SectionTitleBlock />

            {/* METRO ROUTE MAP BOARD */}
            <RouteMapBoard />
        </div>
    );
};
