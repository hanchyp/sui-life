import React from "react";
import { Icons } from "@/constants";

interface NavigationProps {
  activeTab: "events" | "create" | "dashboard";
  onTabChange: (tab: "events" | "create" | "dashboard") => void;
  onBuyLife?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onBuyLife,
}) => {
  const tabs = [
    { id: "events", label: "Explore Quests", icon: <Icons.Flag /> },
    { id: "create", label: "Create Quest", icon: <Icons.Zap /> },
    { id: "dashboard", label: "Dashboard", icon: <Icons.Target /> },
  ];

  return (
    <div className="hidden md:flex h-8 bg-slate-100 rounded-lg p-1 border border-slate-200 items-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() =>
            onTabChange(tab.id as "events" | "create" | "dashboard")
          }
          className={`px-4 h-full rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
            activeTab === tab.id
              ? "bg-[#6FD6F7] text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
      {onBuyLife && (
        <>
          <div className="w-px h-3 bg-slate-300 mx-1"></div>
          <button
            onClick={onBuyLife}
            className="px-4 h-full rounded flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#6FD6F7] hover:bg-[#6FD6F7]/10 transition-colors"
          >
            Buy LIFE
          </button>
        </>
      )}
    </div>
  );
};
