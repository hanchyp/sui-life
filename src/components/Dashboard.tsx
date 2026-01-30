import React from "react";
import { Event, EventStatus } from "@/types";
import { Icons } from "@/constants";
import { Button } from "./Button";

interface DashboardProps {
  currentAccount: string | null;
  myEvents: Event[];
  joinedEvents: Event[];
  submittedEventIds: string[];
  submissionObjects: Record<string, string>;
  onClaim: (eventId: string, vaultId: string, submissionId?: string) => void;
  onViewEvent: (event: Event) => void;
  onVerify?: (event: Event) => void;
}

// Status badge styling
const getStatusBadge = (status: EventStatus) => {
  const styles: Record<
    EventStatus,
    { bg: string; text: string; label: string }
  > = {
    PENDING: {
      bg: "bg-yellow-400/10",
      text: "text-yellow-500",
      label: "Pending",
    },
    RUNNING: {
      bg: "bg-green-400/10",
      text: "text-green-500",
      label: "Running",
    },
    ENDED: { bg: "bg-orange-400/10", text: "text-orange-500", label: "Ended" },
    VERIFIED: {
      bg: "bg-blue-400/10",
      text: "text-blue-500",
      label: "Completed",
    },
  };
  return styles[status] || styles.PENDING;
};

export const Dashboard: React.FC<DashboardProps> = ({
  currentAccount,
  myEvents,
  joinedEvents,
  submittedEventIds,
  onClaim,
  onViewEvent,
  onVerify,
}) => {
  const [activeTab, setActiveTab] = React.useState<"joined" | "created">(
    "joined",
  );

  if (!currentAccount) {
    return (
      <div className="text-center py-20 text-slate-400">
        <Icons.Zap />
        <p className="mt-4">
          Please connect your wallet to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase font-bold mb-2">
            Quests Joined
          </p>
          <p className="text-3xl font-black text-slate-800">
            {joinedEvents.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase font-bold mb-2">
            Quests Created
          </p>
          <p className="text-3xl font-black text-[#6FD6F7]">
            {myEvents.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase font-bold mb-2">
            Proofs Submitted
          </p>
          <p className="text-3xl font-black text-blue-400">
            {
              joinedEvents.filter((e) => submittedEventIds.includes(e.id))
                .length
            }
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs uppercase font-bold mb-2">
            Awaiting Verification
          </p>
          <p className="text-3xl font-black text-orange-400">
            {myEvents.filter((e) => e.status === "ENDED").length}
          </p>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab("joined")}
          className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all ${
            activeTab === "joined"
              ? "bg-slate-800 text-white"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          Joined Quests
        </button>
        <button
          onClick={() => setActiveTab("created")}
          className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all ${
            activeTab === "created"
              ? "bg-[#6FD6F7] text-slate-800"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          Created Quests
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {activeTab === "joined" && (
          <div>
            {joinedEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>
                  You haven't joined any quests yet. Explore and take real
                  action!
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="p-4">Quest Name</th>
                    <th className="p-4">Reward</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {joinedEvents.map((event) => {
                    const isSubmitted = submittedEventIds.includes(event.id);
                    const statusBadge = getStatusBadge(event.status);
                    const isApproved =
                      event.approvedParticipants?.includes(currentAccount);
                    const hasClaimed =
                      event.claimedParticipants?.includes(currentAccount);

                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 font-bold text-slate-800">
                          {event.name}
                        </td>
                        <td className="p-4 font-mono text-[#6FD6F7]">
                          {event.rewardAmount} {event.rewardAsset}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                          {isApproved && !hasClaimed && (
                            <span className="ml-2 text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-600">
                              Approved ✓
                            </span>
                          )}
                          {hasClaimed && (
                            <span className="ml-2 text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-600">
                              Claimed ✓
                            </span>
                          )}
                        </td>
                        <td className="p-4 flex gap-2">
                          <Button
                            onClick={() => onViewEvent(event)}
                            className="text-xs py-1 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700"
                          >
                            View
                          </Button>
                          {(event.status === "VERIFIED" || isApproved) &&
                            isApproved &&
                            !hasClaimed && (
                              <Button
                                onClick={() => onClaim(event.id, event.vaultId)}
                                className="text-xs py-1 px-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                              >
                                Claim
                              </Button>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "created" && (
          <div>
            {myEvents.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p>
                  You haven't created any quests yet. Start one and invite
                  others!
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="p-4">Quest Name</th>
                    <th className="p-4">Participants</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myEvents.map((event) => {
                    const statusBadge = getStatusBadge(event.status);

                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-slate-800">
                            {event.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {event.description}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="font-bold">
                            {event.currentParticipants} /{" "}
                            {event.maxParticipants}
                          </div>
                          {event.status === "VERIFIED" && (
                            <div className="text-xs text-green-500">
                              {event.approvedParticipants?.length || 0} approved
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <Button
                            onClick={() => onViewEvent(event)}
                            className="text-xs py-1 px-3 bg-slate-800 hover:bg-slate-700 text-white"
                          >
                            View
                          </Button>
                          {(event.status === "ENDED" ||
                            Date.now() > event.endTime) &&
                            event.status !== "VERIFIED" &&
                            onVerify && (
                              <Button
                                onClick={() => onVerify(event)}
                                className="text-xs py-1 px-3 bg-green-600 hover:bg-green-500 text-white font-bold"
                              >
                                Verify
                              </Button>
                            )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
