import React from "react";
import { ProjectConfig } from "../config/bestWorkConfig";
import { useTransit } from "../context/TransitContext";

export const ProjectStation: React.FC<{
    project: ProjectConfig;
    stationIndex: number;
    dataIndex: number;
}> = ({ project, stationIndex, dataIndex }) => {
    const { config, transitStations, stepOutToCaseStudy } = useTransit();
    const nextStationName =
        transitStations[stationIndex + 1]?.stationName || "TERMINUS";

    const projectName = project.name || project.stat;
    const keyword = project.keyword || "System";

    return (
        <div
            className="relative h-full w-[100vw] flex-shrink-0 flex flex-col items-center justify-end pb-[185px] md:pb-[280px] z-[40]"
            data-index={stationIndex}
        >
            {/* Oversized Faded Background Keyword */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Schoolbell'] text-[35vw] md:text-[25vw] leading-none text-[#0B0B0B] opacity-[0.03] whitespace-nowrap z-0 pointer-events-none tracking-tighter mix-blend-multiply">
                {keyword}
            </div>

            {/* THE MOUNTED BILLBOARD ASSEMBLY */}
            <div className="relative flex flex-col items-center w-[95%] md:w-[1035px] max-w-[95%] z-[50] group mb-2 md:mb-4 -translate-y-[25px]">
                {/* Delhi Metro LED Display Board */}
                <div className="w-[90%] md:w-[700px] h-[30px] md:h-[40px] bg-[#0A0A0A] border-[3px] border-[#222] border-b-0 rounded-t-[8px] z-[55] flex items-center justify-center overflow-hidden px-4 shadow-[inset_0_4px_15px_rgba(0,0,0,1)] relative self-end mr-[2%] md:mr-[5%]">
                    {/* Subtle reflection on LED glass */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <div
                        className="text-[#FFB000] font-['DM_Mono'] text-[9px] md:text-[13px] font-bold tracking-widest uppercase w-full text-center whitespace-nowrap"
                        style={{ textShadow: "0 0 8px rgba(255,176,0,0.9)" }}
                    >
                        {`कृपया दरवाजों से दूर रहें • NEXT STATION: ${nextStationName}`}
                    </div>
                </div>

                {/* Heavy Industrial Support Columns */}
                <div className="absolute -bottom-[180px] md:-bottom-[280px] left-[15%] w-[24px] md:w-[32px] h-[250px] md:h-[350px] bg-[#111] border-r-[4px] border-[#222] shadow-[inset_4px_0_8px_rgba(0,0,0,0.5)] z-[45]">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhsOC04bTAtNEwtNCA4IiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20" />
                </div>
                <div className="absolute -bottom-[180px] md:-bottom-[280px] right-[15%] w-[24px] md:w-[32px] h-[250px] md:h-[350px] bg-[#111] border-l-[4px] border-[#222] shadow-[inset_-4px_0_8px_rgba(0,0,0,0.5)] z-[45]">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhsOC04bTAtNEwtNCA4IiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20" />
                </div>

                {/* Heavy Mounting Brackets */}
                <div className="absolute bottom-[20%] left-[15%] w-[40px] md:w-[50px] h-[20px] bg-[#080808] -translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />
                <div className="absolute bottom-[20%] right-[15%] w-[40px] md:w-[50px] h-[20px] bg-[#080808] translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />
                <div className="absolute top-[30%] left-[15%] w-[40px] md:w-[50px] h-[20px] bg-[#080808] -translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />
                <div className="absolute top-[30%] right-[15%] w-[40px] md:w-[50px] h-[20px] bg-[#080808] translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />

                {/* Billboard Frame (Flatter, Cinematic Proportions) */}
                <div className="w-full h-[220px] md:h-[240px] bg-[#14100E] border-[6px] md:border-[8px] border-[#14100E] flex flex-col md:flex-row items-stretch shadow-[16px_16px_0_rgba(20,16,14,0.25)] transition-transform duration-500 relative z-[50]">
                    {/* Left Panel (Dynamic Background) */}
                    <div
                        className="w-full md:w-[45%] flex flex-col justify-center items-center border-b-[6px] md:border-b-0 md:border-r-[6px] md:border-r-[8px] border-[#14100E] relative overflow-hidden py-4 md:py-6"
                        style={{
                            background: `radial-gradient(circle at 50% 50%, ${
                                project.bg || "#2A2522"
                            } 0%, #14100E 140%)`,
                        }}
                    >
                        {/* CRT Scanline Overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-[0.35] mix-blend-overlay z-[5]"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.9) 2px, rgba(0,0,0,0.9) 4px)",
                                backgroundSize: "100% 4px",
                            }}
                        />
                        {/* Print Noise Overlay */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-60 mix-blend-overlay pointer-events-none z-[6]" />

                        {/* Massive Handwritten Project Name */}
                        <h3
                            className="font-['Schoolbell'] text-[70px] md:text-[90px] leading-[0.8] relative z-10 billboard-float text-center transform -rotate-2"
                            style={{
                                color: project.text || "#FFFFFF",
                                textShadow:
                                    "4px 4px 0px #14100E, 6px 6px 0px rgba(0,0,0,0.3)",
                            }}
                        >
                            {projectName}
                        </h3>
                    </div>

                    {/* Right Panel (Solid Black) */}
                    <div className="w-full md:w-[55%] flex flex-col justify-between bg-[#14100E] text-white p-4 md:p-6 relative h-full overflow-hidden group/panel">
                        {/* Subtle Grid Background */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-20 z-0"
                            style={{
                                backgroundImage:
                                    "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
                                backgroundSize: "20px 20px",
                            }}
                        />

                        {/* Glitch Accents */}
                        <div className="absolute top-3 right-3 w-[4px] h-[18px] bg-[#D4A017] shadow-[2px_2px_0_rgba(20,16,14,0.9)] opacity-80 group-hover/panel:opacity-100 group-hover/panel:translate-x-[2px] transition-all duration-75 z-10" />
                        <div className="absolute bottom-3 right-3 w-[24px] h-[4px] bg-[#D4A017] shadow-[2px_-2px_0_rgba(20,16,14,0.9)] opacity-80 group-hover/panel:opacity-100 group-hover/panel:-translate-y-[2px] transition-all duration-75 z-10" />

                        {/* Top: Campaign Description & Key Points */}
                        <div className="flex flex-col gap-2 relative z-10">
                            <p className="font-['Inter'] font-bold text-[13px] md:text-[15px] leading-[1.4] text-[#F4EFE6] w-[95%] uppercase tracking-[-0.02em]">
                                {project.summary}
                            </p>

                            <ul className="flex flex-col gap-1.5 mt-2 ml-1">
                                {project.points.map((p, idx) => (
                                    <li
                                        key={idx}
                                        aria-hidden="true"
                                        className="flex items-start gap-2"
                                    >
                                        <svg
                                            className="w-3 h-3 text-[#D4A017] mt-0.5 shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="3"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                        <span className="text-[#D1D1D1] font-['Inter'] text-[10px] md:text-[12px] font-medium leading-snug tracking-tight">
                                            {p}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Bottom: Oversized Impact Metrics */}
                        <div className="flex justify-between items-end w-full border-t border-white/40 pt-3 mt-auto">
                            <div className="flex flex-col">
                                <span
                                    aria-hidden="true"
                                    className="font-['DM_Mono'] font-bold text-white text-[9px] md:text-[11px] tracking-widest uppercase mb-1"
                                >
                                    {project.metricLabels?.[0] || "METRIC 1"}
                                </span>
                                <div className="font-['Bebas_Neue'] text-[35px] md:text-[50px] leading-[0.8] tracking-tight text-white">
                                    {project.metrics?.[0] || project.stat}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    aria-hidden="true"
                                    className="font-['DM_Mono'] font-bold text-white text-[9px] md:text-[11px] tracking-widest uppercase mb-1"
                                >
                                    {project.metricLabels?.[1] || "METRIC 2"}
                                </span>
                                <div className="font-['Bebas_Neue'] text-[35px] md:text-[50px] leading-[0.8] tracking-tight text-white">
                                    {project.metrics?.[1] || "80%"}
                                </div>
                            </div>
                            <div className="flex flex-col text-right">
                                <span
                                    aria-hidden="true"
                                    className="font-['DM_Mono'] font-bold text-white text-[9px] md:text-[11px] tracking-widest uppercase mb-1"
                                >
                                    {project.metricLabels?.[2] || "METRIC 3"}
                                </span>
                                <div className="font-['Bebas_Neue'] text-[35px] md:text-[50px] leading-[0.8] tracking-tight text-white">
                                    {project.metrics?.[2] || "24H"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Left Aligned Step Out Button */}
                    <button
                        id={`step-out-btn-${stationIndex}`}
                        onClick={(e) => stepOutToCaseStudy(e, dataIndex)}
                        data-cursor="pointer"
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E] step-out-btn attention-pulse absolute -top-5 md:-top-7 -left-4 md:-left-8 bg-[#D4A017] hover:bg-[#14100E] text-[#14100E] hover:text-[#ECE8E1] font-['DM_Mono'] text-[12px] md:text-[14px] font-bold tracking-wide leading-tight uppercase px-5 md:px-8 py-2 md:py-3 border-[4px] border-[#14100E] shadow-[8px_8px_0_rgba(20,16,14,1)] flex items-center gap-3 hover:translate-y-[2px] hover:shadow-[4px_4px_0_rgba(20,16,14,1)] transition-all cursor-pointer z-[60] w-max opacity-0 pointer-events-none group text-left"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(20,16,14,0.15) 10px, rgba(20,16,14,0.15) 20px)",
                        }}
                    >
                        <div className="flex flex-col">
                            <span>{config.train.stepOutLine1}</span>
                            <span>{config.train.stepOutLine2}</span>
                        </div>
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transform group-hover:scale-110 transition-transform ml-2"
                        >
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
