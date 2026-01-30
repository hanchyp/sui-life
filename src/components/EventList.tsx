import React from "react";
import { Event } from "@/types";
import { EventCard } from "./EventCard";
import { Icons } from "@/constants";

interface EventListProps {
  events: Event[];
  joinedEventIds: string[];
  submittedEventIds: string[];
  onJoin: (id: string) => void;
  onCreateClick: () => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  joinedEventIds,
  submittedEventIds,
  onJoin,
  onCreateClick,
}) => {
  return (
    <div className="space-y-8 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Explore Quests
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Find quests, complete real-life actions, earn rewards.
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="h-11 px-6 bg-[#6FD6F7] text-black hover:bg-[#5BBCE0] rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(111,214,247,0.3)] flex items-center gap-2"
        >
          <Icons.Zap /> CREATE QUEST
        </button>
      </header>

      {events.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
          <span className="text-slate-600 mb-4 opacity-50 scale-150">
            <Icons.Flag />
          </span>
          <p className="text-slate-500 text-sm font-medium">
            No active quests found. Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isJoined={joinedEventIds.includes(event.id)}
              isSubmitted={submittedEventIds.includes(event.id)}
              onJoin={onJoin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
