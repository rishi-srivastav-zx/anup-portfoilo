"use client";

import React, { useState } from "react";
import { Users, Search, ShieldCheck, Key, UserCheck, Shield } from "lucide-react";

export default function RegisteredUsersTable({ usersList = [], stats = {} }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = usersList.filter((u) => {
        const q = searchQuery.toLowerCase();
        return (
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q)
        );
    });

    return (
        <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D6CDC2]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#8C8278]">
                            [ 05 // SYSTEM ADMINISTRATION ]
                        </span>
                    </div>
                    <h2 className="font-sans font-bold text-xl text-[#14100E] tracking-tight flex items-center gap-2">
                        <span>Registered User Accounts</span>
                        <span className="text-[10px] font-mono uppercase bg-[#14100E] text-[#F4EDE4] px-2 py-0.5 rounded">
                            Superuser Only
                        </span>
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#8C8278] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter registered users..."
                            className="bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg text-xs px-3 py-1.5 pl-8 text-[#14100E] placeholder-[#8C8278] outline-none focus:border-[#14100E]"
                        />
                    </div>
                    <span className="text-xs font-mono text-[#8C8278] whitespace-nowrap">
                        {filtered.length} of {usersList.length}
                    </span>
                </div>
            </div>

            {/* Admin Metrics Mini-Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-[#8C8278] block">
                        Total Users
                    </span>
                    <span className="font-sans font-bold text-xl text-[#14100E]">
                        {stats.totalUsers ?? usersList.length}
                    </span>
                </div>
                <div className="p-3 bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-[#8C8278] block">
                        Active Accounts
                    </span>
                    <span className="font-sans font-bold text-xl text-[#14100E]">
                        {stats.activeUsers ?? usersList.filter((u) => u.is_active).length}
                    </span>
                </div>
                <div className="p-3 bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-[#8C8278] block">
                        Administrators
                    </span>
                    <span className="font-sans font-bold text-xl text-[#14100E]">
                        {stats.totalAdmins ?? usersList.filter((u) => u.role === "admin").length}
                    </span>
                </div>
                <div className="p-3 bg-[#F4EDE4] border border-[#D6CDC2] rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-[#8C8278] block">
                        Active Sessions
                    </span>
                    <span className="font-sans font-bold text-xl text-[#14100E]">
                        {stats.activeSessions ?? "1"}
                    </span>
                </div>
            </div>

            {/* Users Table */}
            <div className="border border-[#D6CDC2] rounded-xl overflow-hidden bg-[#F4EDE4] shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#EAE2D7] text-[#6B625A] font-mono text-[10px] uppercase tracking-wider border-b border-[#D6CDC2]">
                            <tr>
                                <th className="px-5 py-3">Account Identity</th>
                                <th className="px-5 py-3">Role</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3">Registration Date</th>
                                <th className="px-5 py-3">Last Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D6CDC2]/60 text-[#4A423B]">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-5 py-8 text-center text-[#8C8278] font-mono text-xs"
                                    >
                                        No registered accounts found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u) => (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-[#EAE2D7]/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="font-bold text-[#14100E]">
                                                {u.name}
                                            </div>
                                            <div className="text-[11px] font-mono text-[#8C8278]">
                                                {u.email}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                                                    u.role === "admin"
                                                        ? "bg-[#14100E] text-[#F4EDE4]"
                                                        : "bg-[#EAE2D7] text-[#4A423B] border border-[#D6CDC2]"
                                                }`}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono ${
                                                    u.is_active
                                                        ? "text-emerald-800"
                                                        : "text-[#8C8278]"
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        u.is_active
                                                            ? "bg-emerald-600"
                                                            : "bg-[#8C8278]"
                                                    }`}
                                                />
                                                {u.is_active ? "Active" : "Disabled"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-[11px] text-[#8C8278]">
                                            {u.created_at
                                                ? new Date(u.created_at).toLocaleDateString()
                                                : "Recent"}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-[11px] text-[#8C8278]">
                                            {u.last_login_at
                                                ? new Date(u.last_login_at).toLocaleString()
                                                : "Never"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-5 py-2.5 bg-[#EAE2D7]/60 border-t border-[#D6CDC2] flex items-center justify-between text-[10px] font-mono text-[#8C8278]">
                    <span>PASSWORDS HASHED VIA ARGON2ID &bull; SECURE ROTATING TOKENS</span>
                    <span>RESTRICTED ACCESS</span>
                </div>
            </div>
        </section>
    );
}
