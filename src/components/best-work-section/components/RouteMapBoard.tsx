import React from "react";
import { useTransit } from "../context/TransitContext";

export const RouteMapBoard: React.FC = () => {
    const { config, transitStations, activeStationIdx } = useTransit();
    const { routeBoard, projects } = config;
    const { dummyStationsList } = routeBoard;

    const totalNodes = transitStations.length + dummyStationsList.length; // 6 + 5 = 11
    const targetNodeIndex = activeStationIdx * 2;
    const targetPercentage = (targetNodeIndex / (totalNodes - 1)) * 100;

    const nodes = Array.from({ length: totalNodes }, (_, i) => {
        const isMajor = i % 2 === 0;
        const majorIndex = isMajor ? i / 2 : -1;
        const dummyIndex = isMajor ? -1 : (i - 1) / 2;
        const left = (i / (totalNodes - 1)) * 100;
        const isCompletedOrActive = i <= targetNodeIndex;

        if (isMajor) {
            let name =
                majorIndex === 0
                    ? routeBoard.originLabel
                    : (
                          projects[majorIndex - 1]?.name ||
                          `PROJECT ${majorIndex}`
                      ).toUpperCase();
            if (name.includes(" ")) {
                name = name.replace(" ", "<br/>");
            }

            return (
                <div
                    key={`major-${majorIndex}`}
                    data-idx={majorIndex}
                    className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-20 fixed-route-node route-major"
                    style={{ left: `${left}%`, top: "50%" }}
                >
                    {/* Station Node */}
                    <div
                        className="route-dot w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-[2.5px] sm:border-[3px] md:border-[5px] border-[#14100E] bg-white transition-all duration-500 relative z-10"
                        style={{
                            backgroundColor: isCompletedOrActive
                                ? "#14100E"
                                : "#F4EFE6",
                            borderColor: "#14100E",
                            transform: "scale(1)",
                        }}
                    />
                    {/* Dark Tilted Label */}
                    <div
                        aria-hidden="true"
                        className="absolute bottom-full mb-[-2px] md:mb-0 bg-[#14100E] px-1 sm:px-1.5 md:px-2 py-[1.5px] sm:py-[2px] md:py-[3px] transform rotate-[-58deg] origin-bottom-left left-[50%] ml-[6px] sm:ml-[10px] md:ml-[15px] transition-all duration-500 opacity-60 node-label text-center font-['DM_Mono'] text-[#ECE8E1] text-[7.5px] sm:text-[9px] md:text-[13px] uppercase font-bold"
                        style={{
                            lineHeight: 1.04,
                            letterSpacing: "-0.02em",
                            opacity: isCompletedOrActive ? 1 : 0.4,
                        }}
                        dangerouslySetInnerHTML={{ __html: name }}
                    />
                </div>
            );
        }

        let name = dummyStationsList[dummyIndex] || "";
        if (name === "VISHWAVIDYALAYA") {
            name = "VISHWA-<br/>VIDYALAYA";
        } else if (name.includes(" ")) {
            name = name.replace(" ", "<br/>");
        }

        return (
            <div
                key={`dummy-${dummyIndex}`}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-10 fixed-route-node route-dummy"
                style={{ left: `${left}%`, top: "50%" }}
            >
                {/* Node */}
                <div
                    className="route-dot w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 md:w-5 md:h-5 rounded-full border-[2px] sm:border-[3px] md:border-[5px] border-[#14100E] bg-white transition-all duration-500 relative z-10"
                    style={{
                        backgroundColor: isCompletedOrActive
                            ? "#14100E"
                            : "#F4EFE6",
                        borderColor: "#14100E",
                        transform: "scale(1)",
                    }}
                />
                {/* Text Below */}
                <div
                    aria-hidden="true"
                    className="absolute top-full mt-[-2px] md:mt-0 font-['DM_Mono'] font-bold text-[#14100E] text-[7px] sm:text-[8.5px] md:text-[13px] opacity-80 node-label text-center transform rotate-[-58deg] origin-top-right right-[50%] mr-[6px] sm:mr-[10px] md:mr-[15px] uppercase"
                    style={{ lineHeight: 1.04, letterSpacing: "-0.02em" }}
                    dangerouslySetInnerHTML={{ __html: name }}
                />
            </div>
        );
    });

    return (
        <div
            id="fixed-route-board"
            className="absolute top-[155px] sm:top-[195px] left-3 right-3 sm:left-6 sm:right-6 md:top-7 md:left-auto md:right-8 lg:right-12 z-20 w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] md:w-[48%] lg:w-[44%] xl:w-[40%] h-[82px] sm:h-[105px] md:h-[135px] border-[3px] md:border-[4px] border-[#14100E] shadow-[5px_5px_0_rgba(20,16,14,0.3)] md:shadow-[6px_6px_0_rgba(20,16,14,0.3)] pointer-events-none flex flex-col items-center justify-center overflow-visible"
            style={{ backgroundColor: routeBoard.boardBg || "#F4EFE6" }}
        >
            {/* Subtle Background Texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDBoNDB2MUgwek0wIDBoMXY0MEgwek0zOSAwaDF2NDBoLTF6IiBmaWxsPSJyZ2JhKDIwLCAxNiwgMTQsIDAuMDUpIi8+PC9zdmc+')] opacity-60 z-0" />

            {/* The Route Line */}
            <div className="relative w-[90%] md:w-[85%] mx-auto h-[35px] md:h-[40px] flex items-center justify-center z-10">
                {/* Background Line */}
                <div className="absolute left-0 right-0 h-[3px] md:h-[4px] bg-[#D8D4CC] rounded-full" />
                {/* Active Fill Line */}
                <div
                    id="fixed-progress-line"
                    className="absolute left-0 h-[3px] md:h-[4px] bg-[#14100E] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${targetPercentage}%` }}
                />

                {/* Nodes */}
                <div
                    id="fixed-route-nodes"
                    className="absolute inset-0 w-full h-full"
                >
                    {nodes}
                </div>
            </div>
        </div>
    );
};
