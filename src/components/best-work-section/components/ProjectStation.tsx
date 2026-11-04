import React from "react";
import { ProjectConfig } from "../config/bestWorkConfig";
import { useTransit } from "../context/TransitContext";
import { CinematicVideoDisplay } from "./CinematicVideoDisplay";

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
            className="relative h-full w-[100vw] flex-shrink-0 flex flex-col items-center justify-end pb-[220px] sm:pb-[240px] md:pb-[250px] lg:pb-[270px] z-[40]"
            data-index={stationIndex}
        >
            {/* Oversized Faded Background Keyword */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans text-[35vw] md:text-[25vw] leading-none text-[#0B0B0B] opacity-[0.03] whitespace-nowrap z-0 pointer-events-none tracking-tighter mix-blend-multiply">
                {keyword}
            </div>

            {/* THE MOUNTED BILLBOARD ASSEMBLY */}
            <div className="relative flex flex-col items-center w-[86%] sm:w-[88%] md:w-[1035px] max-w-[92%] z-[50] group mb-2 md:mb-4 -translate-y-0 md:-translate-y-[20px]">
                {/* Delhi Metro LED Display Board */}
                <div className="w-[96%] sm:w-[92%] md:w-[700px] h-[20px] sm:h-[26px] md:h-[40px] bg-[#0A0A0A] border-[2px] sm:border-[3px] border-[#222] border-b-0 rounded-t-[6px] sm:rounded-t-[8px] z-[55] flex items-center justify-center overflow-hidden px-1.5 sm:px-4 shadow-[inset_0_4px_15px_rgba(0,0,0,1)] relative self-end mr-[2%] md:mr-[5%]">
                    {/* Subtle reflection on LED glass */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                    <div
                        className="text-[#FFB000] font-['DM_Mono'] text-[7px] sm:text-[9px] md:text-[13px] font-bold tracking-widest uppercase w-full text-center whitespace-nowrap overflow-hidden text-ellipsis px-1"
                        style={{ textShadow: "0 0 8px rgba(255,176,0,0.9)" }}
                    >
                        {`FEATURED FILM • NEXT PROJECT: ${nextStationName}`}
                    </div>
                </div>

                {/* Heavy Industrial Support Columns */}
                <div className="block absolute -bottom-[220px] sm:-bottom-[240px] md:-bottom-[250px] lg:-bottom-[270px] left-[15%] w-[16px] sm:w-[24px] md:w-[32px] h-[260px] sm:h-[280px] md:h-[300px] lg:h-[320px] bg-[#111] border-r-[3px] md:border-r-[4px] border-[#222] shadow-[inset_4px_0_8px_rgba(0,0,0,0.5)] z-[45]">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhsOC04bTAtNEwtNCA4IiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20" />
                </div>
                <div className="block absolute -bottom-[220px] sm:-bottom-[240px] md:-bottom-[250px] lg:-bottom-[270px] right-[15%] w-[16px] sm:w-[24px] md:w-[32px] h-[260px] sm:h-[280px] md:h-[300px] lg:h-[320px] bg-[#111] border-l-[3px] md:border-l-[4px] border-[#222] shadow-[inset_-4px_0_8px_rgba(0,0,0,0.5)] z-[45]">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDhsOC04bTAtNEwtNCA4IiBzdHJva2U9IiMyMjIiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20" />
                </div>

                {/* Heavy Mounting Brackets */}
                <div className="block absolute bottom-[20%] left-[15%] w-[28px] sm:w-[40px] md:w-[50px] h-[14px] md:h-[20px] bg-[#080808] -translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />
                <div className="block absolute bottom-[20%] right-[15%] w-[28px] sm:w-[40px] md:w-[50px] h-[14px] md:h-[20px] bg-[#080808] translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />
                <div className="block absolute top-[30%] left-[15%] w-[28px] sm:w-[40px] md:w-[50px] h-[14px] md:h-[20px] bg-[#080808] -translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />
                <div className="block absolute top-[30%] right-[15%] w-[28px] sm:w-[40px] md:w-[50px] h-[14px] md:h-[20px] bg-[#080808] translate-x-1/2 rounded-sm z-[46] border-[2px] border-[#222]" />

                {/* Billboard Frame (Flatter, Cinematic Proportions) */}
                <div className="w-full h-auto md:h-[240px] bg-[#14100E] border-[4px] sm:border-[6px] md:border-[8px] border-[#14100E] flex flex-col md:flex-row items-stretch shadow-[6px_6px_0_rgba(20,16,14,0.25)] md:shadow-[16px_16px_0_rgba(20,16,14,0.25)] transition-transform duration-500 relative z-[50]">
                    {/* Left Panel (Cinematic Video Display) */}
                    <div className="w-full md:w-[45%] h-[180px] sm:h-[200px] md:h-auto min-h-[170px] border-b-[4px] md:border-b-0 md:border-r-[8px] border-[#14100E] relative overflow-hidden bg-[#0A0A0A]">
                        <CinematicVideoDisplay
                            title={projectName}
                            videoWebm={project.videoWebm}
                            videoMov={project.videoMov}
                            badgeLabel={`${project.keyword || "FILM"} // 24FPS`}
                        />
                    </div>

                    {/* Right Panel (Solid Black) */}
                    <div className="w-full md:w-[55%] flex flex-col justify-between bg-[#14100E] text-white p-2 sm:p-3 md:p-6 relative h-full overflow-hidden group/panel gap-1.5 md:gap-0">
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
                        <div className="absolute top-2 right-2 md:top-3 md:right-3 w-[3px] md:w-[4px] h-[14px] md:h-[18px] bg-[#D4A017] shadow-[2px_2px_0_rgba(20,16,14,0.9)] opacity-80 group-hover/panel:opacity-100 group-hover/panel:translate-x-[2px] transition-all duration-75 z-10" />
                        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-[18px] md:w-[24px] h-[3px] md:h-[4px] bg-[#D4A017] shadow-[2px_-2px_0_rgba(20,16,14,0.9)] opacity-80 group-hover/panel:opacity-100 group-hover/panel:-translate-y-[2px] transition-all duration-75 z-10" />

                        {/* Top: Campaign Description & Key Points */}
                        <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2 relative z-10">
                            <p className="font-sans font-bold text-[10px] sm:text-[12px] md:text-[15px] leading-[1.3] md:leading-[1.4] text-[#F4EFE6] w-[95%] uppercase tracking-[-0.02em]">
                                {project.summary}
                            </p>

                            <ul className="flex flex-col gap-0.5 sm:gap-1 md:gap-1.5 mt-0.5 sm:mt-1 md:mt-2 ml-0.5 md:ml-1">
                                {project.points.map((p, idx) => (
                                    <li
                                        key={idx}
                                        aria-hidden="true"
                                        className="flex items-start gap-1.5 sm:gap-2"
                                    >
                                        <svg
                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D4A017] mt-0.5 shrink-0"
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
                                        <span className="text-[#D1D1D1] font-sans text-[8.5px] sm:text-[10px] md:text-[12px] font-medium leading-snug tracking-tight">
                                            {p}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Bottom: Oversized Impact Metrics */}
                        <div className="flex justify-between items-end w-full border-t border-white/40 pt-1.5 sm:pt-2 md:pt-3 mt-auto">
                            <div className="flex flex-col">
                                <span
                                    aria-hidden="true"
                                    className="font-['DM_Mono'] font-bold text-white text-[7.5px] sm:text-[9px] md:text-[11px] tracking-widest uppercase mb-0.5 sm:mb-1"
                                >
                                    {project.metricLabels?.[0] || "METRIC 1"}
                                </span>
                                <div className="font-sans text-[22px] sm:text-[30px] md:text-[50px] leading-[0.8] tracking-tight text-white">
                                    {project.metrics?.[0] || project.stat}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    aria-hidden="true"
                                    className="font-['DM_Mono'] font-bold text-white text-[7.5px] sm:text-[9px] md:text-[11px] tracking-widest uppercase mb-0.5 sm:mb-1"
                                >
                                    {project.metricLabels?.[1] || "METRIC 2"}
                                </span>
                                <div className="font-sans text-[22px] sm:text-[30px] md:text-[50px] leading-[0.8] tracking-tight text-white">
                                    {project.metrics?.[1] || "80%"}
                                </div>
                            </div>
                            <div className="flex flex-col text-right">
                                <span
                                    aria-hidden="true"
                                    className="font-['DM_Mono'] font-bold text-white text-[7.5px] sm:text-[9px] md:text-[11px] tracking-widest uppercase mb-0.5 sm:mb-1"
                                >
                                    {project.metricLabels?.[2] || "METRIC 3"}
                                </span>
                                <div className="font-sans text-[22px] sm:text-[30px] md:text-[50px] leading-[0.8] tracking-tight text-white">
                                    {project.metrics?.[2] || "24H"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
