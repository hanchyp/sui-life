import React from "react";
import { Event, EventStatus } from "@/types";
import { Icons } from "@/constants";

interface EventCardProps {
  event: Event;
  isJoined?: boolean;
  isSubmitted?: boolean;
  onJoin?: (id: string) => void;
  onView?: (id: string) => void;
}

// Status badge styling
const getEventStatusBadge = (status: EventStatus) => {
  const styles: Record<
    EventStatus,
    { bg: string; border: string; text: string; label: string }
  > = {
    PENDING: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-500",
      label: "PENDING",
    },
    RUNNING: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-500",
      label: "RUNNING",
    },
    ENDED: {
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-500",
      label: "ENDED",
    },
    VERIFIED: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-500",
      label: "VERIFIED",
    },
  };
  return styles[status] || styles.PENDING;
};

// Format time remaining
const getTimeInfo = (event: Event): string => {
  const now = Date.now();

  if (event.status === "VERIFIED") {
    return "Rewards available";
  }

  if (now < event.startTime) {
    const diff = event.startTime - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    return `Starts in ${hours}h`;
  }

  if (now > event.endTime) {
    return "Awaiting verification";
  }

  const diff = event.endTime - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isJoined = false,
  isSubmitted = false,
  onJoin,
}) => {
  const eventStatus = getEventStatusBadge(event.status);
  const now = Date.now();
  const hasEnded = now > event.endTime;
  const isFull = event.currentParticipants >= event.maxParticipants;
  const canJoin =
    (event.status === "PENDING" || event.status === "RUNNING") && !hasEnded;

  const getStatusBadge = () => {
    if (isSubmitted) {
      return (
        <span className="px-2 py-1 backdrop-blur-md border rounded text-[10px] font-bold uppercase tracking-widest bg-green-500/20 border-green-500/30 text-green-400">
          SUBMITTED
        </span>
      );
    }
    if (isJoined) {
      return (
        <span className="px-2 py-1 backdrop-blur-md border rounded text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 border-blue-500/30 text-blue-400">
          JOINED
        </span>
      );
    }
    return (
      <span
        className={`px-2 py-1 backdrop-blur-md border rounded text-[10px] font-bold uppercase tracking-widest ${eventStatus.bg} ${eventStatus.border} ${eventStatus.text}`}
      >
        {eventStatus.label}
      </span>
    );
  };

  const getButtonContent = () => {
    if (event.status === "VERIFIED") {
      return {
        text: "View Results",
        className: "bg-blue-500 text-white hover:bg-blue-400",
        icon: <Icons.Trophy className="w-4 h-4" />,
      };
    }
    if (event.status === "ENDED" || hasEnded) {
      return {
        text: "See Details",
        className: "bg-slate-200 text-slate-700 hover:bg-slate-300",
        icon: <Icons.Target className="w-4 h-4" />,
      };
    }
    if (isSubmitted) {
      return {
        text: "View Status",
        className:
          "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200",
        icon: <Icons.Check className="w-4 h-4" />,
      };
    }
    if (isJoined) {
      return {
        text: "Submit Proof",
        className: "bg-blue-600 text-white hover:bg-blue-500",
        icon: <Icons.Flag className="w-4 h-4" />,
      };
    }
    if (isFull) {
      return {
        text: "Event Full",
        className: "bg-slate-200 text-slate-500 cursor-not-allowed",
        icon: <Icons.Users className="w-4 h-4" />,
      };
    }
    return {
      text: "Join Quest",
      className: "bg-[#6FD6F7] text-black hover:bg-[#5BBCE0]",
      icon: <Icons.Flag className="w-4 h-4" />,
    };
  };

  const buttonConfig = getButtonContent();

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#6FD6F7] transition-all duration-300 shadow-sm hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-slate-950">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />

        <div className="absolute top-3 left-3 flex gap-2">
          {getStatusBadge()}
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {event.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              By {event.creator.slice(0, 6)}...{event.creator.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-4">
        {/* Reward */}
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-xs font-bold text-slate-500 uppercase">
            Reward
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-[#6FD6F7]">
              {event.rewardAmount}
            </span>
            <span className="text-lg font-bold text-[#4DA2FF]">SUI</span>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <Icons.Users className="w-4 h-4" />
            <span>
              {event.currentParticipants}/{event.maxParticipants}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Icons.Clock className="w-4 h-4" />
            <span>{getTimeInfo(event)}</span>
          </div>
        </div>

        <button
          onClick={() => onJoin?.(event.id)}
          disabled={isFull && !isJoined && canJoin}
          className={`w-full h-11 rounded-lg font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2 ${buttonConfig.className}`}
        >
          {buttonConfig.icon} {buttonConfig.text}
        </button>
      </div>
    </div>
  );
};
