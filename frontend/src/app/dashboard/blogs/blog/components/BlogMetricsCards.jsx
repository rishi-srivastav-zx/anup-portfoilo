"use client";

import React from "react";
import { BookOpen, CheckCircle, FileEdit, Star, Clock } from "lucide-react";

export default function BlogMetricsCards({ articles = [], stats: serverStats = null }) {
  const total = serverStats?.total !== undefined ? Number(serverStats.total) : articles.length;
  const published =
    serverStats?.published !== undefined
      ? Number(serverStats.published)
      : articles.filter((a) => a.status === "published").length;
  const drafts =
    serverStats?.draft !== undefined
      ? Number(serverStats.draft)
      : articles.filter((a) => a.status === "draft").length;
  const featured =
    serverStats?.featured !== undefined
      ? Number(serverStats.featured)
      : articles.filter((a) => Boolean(a.isFeatured)).length;

  // Compute average reading time
  const avgMinutes =
    total > 0
      ? Math.round(
          articles.reduce((acc, a) => {
            const num = parseInt(a.readingTime || "5", 10) || 5;
            return acc + num;
          }, 0) / total
        )
      : 0;

  const cardList = [
    {
      label: "TOTAL ARTICLES",
      value: total,
      subtext: "Indexed in repository",
      icon: BookOpen,
      iconColor: "text-[#14100E]",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "PUBLISHED LIVE",
      value: published,
      subtext: "Live on /blog route",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "INTERNAL DRAFTS",
      value: drafts,
      subtext: "In editorial prep",
      icon: FileEdit,
      iconColor: "text-amber-600",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "FEATURED STORIES",
      value: featured,
      subtext: "Hero placement",
      icon: Star,
      iconColor: "text-[#012CEB]",
      bg: "bg-[#F4EFE6]",
    },
    {
      label: "AVG. READ TIME",
      value: `${avgMinutes}m`,
      subtext: "Deep technical essays",
      icon: Clock,
      iconColor: "text-[#6B625A]",
      bg: "bg-[#F4EFE6]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
      {cardList.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border-2 border-[#14100E] ${stat.bg} shadow-[3px_3px_0_#14100E] flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono-tech uppercase tracking-wider font-bold text-[#8C8278]">
                {stat.label}
              </span>
              <Icon className={`w-4 h-4 ${stat.iconColor}`} />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-editorial font-bold text-[#14100E]">
                {stat.value}
              </div>
              <div className="text-[11px] font-mono-tech text-[#6B625A] mt-0.5">
                {stat.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

