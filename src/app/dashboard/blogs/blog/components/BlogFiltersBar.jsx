"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BLOG_CATEGORIES } from "../../blogs-form/config/blogFormConfig";

export default function BlogFiltersBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  onResetFilters,
  isFiltered,
}) {
  return (
    <div className="p-4 rounded-2xl border-2 border-[#14100E] bg-[#F4EFE6] shadow-[3px_3px_0_#14100E] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, excerpt, tag, or lighting concept..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#14100E]/20 bg-white text-xs font-mono-tech text-[#14100E] placeholder:text-[#8C8278] focus:outline-none focus:border-[#012CEB]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8278] hover:text-[#14100E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#14100E]/20 bg-white text-xs font-mono-tech text-[#14100E] focus:outline-none focus:border-[#012CEB]"
          >
            <option value="ALL">All Categories</option>
            {BLOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#14100E]/20 bg-white text-xs font-mono-tech text-[#14100E] focus:outline-none focus:border-[#012CEB]"
          >
            <option value="ALL">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Drafts Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#14100E]/20 bg-white text-xs font-mono-tech text-[#14100E] focus:outline-none focus:border-[#012CEB]"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="read_desc">Read Time (Longest)</option>
          </select>

          {/* Reset button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="p-2 rounded-xl border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-mono-tech inline-flex items-center gap-1"
              title="Clear all active filters"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

