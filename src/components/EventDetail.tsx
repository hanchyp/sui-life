import React, { useState } from "react";
import { Event, EventStatus } from "@/types";
import { Button } from "./Button";
import { Icons } from "@/constants";
import { useEventSubmissions } from "@/hooks";

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onJoin: (eventId: string) => void;
  onSubmitProof: (
    eventId: string,
    proof: string,
    participantId: string,
  ) => void;
  onClaim: (eventId: string, vaultId: string, submissionId?: string) => void;
  onVerify?: (eventId: string, approvedAddresses: string[]) => void;
  userAddress?: string;
  isJoined: boolean;
  isSubmitted: boolean;
  participantObjectId?: string;
}

// Status badge styling
const getStatusBadge = (status: EventStatus) => {
  const styles: Record<
    EventStatus,
    { bg: string; text: string; label: string }
  > = {
    PENDING: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      label: "Pending",
    },
    RUNNING: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      label: "Running",
    },
    ENDED: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Ended" },
    VERIFIED: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      label: "Completed",
    },
  };
  return styles[status] || styles.PENDING;
};

// Format timestamp to readable date
const formatDate = (timestamp: number) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

// Calculate time remaining
const getTimeRemaining = (endTime: number) => {
  const now = Date.now();
  const diff = endTime - now;
  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onBack,
  onJoin,
  onSubmitProof,
  onClaim,
  onVerify,
  userAddress,
  isJoined,
  isSubmitted,
  participantObjectId,
}) => {
  const [proofLink, setProofLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch submissions for this event (for creator verification)
  const isCreator = userAddress === event.creator;
  const { submissions, isLoading: isLoadingSubmissions } = useEventSubmissions(
    isCreator ? event.id : null,
  );

  // Helper to get proof URL for a participant
  const getProofForParticipant = (address: string) => {
    return submissions.find((s) => s.submitter === address)?.proofUrl;
  };

  const statusBadge = getStatusBadge(event.status);
  const isApproved = event.approvedParticipants?.includes(userAddress || "");
  const hasClaimed = event.claimedParticipants?.includes(userAddress || "");
  const now = Date.now();
  const hasStarted = now >= event.startTime;
  const hasEnded = now > event.endTime;
  const canJoin =
    !hasEnded && event.currentParticipants < event.maxParticipants;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantObjectId) return;

    setIsSubmitting(true);
    try {
      await onSubmitProof(event.id, proofLink, participantObjectId);
      setProofLink("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!onVerify || selectedParticipants.length === 0) return;

    setIsVerifying(true);
    try {
      await onVerify(event.id, selectedParticipants);
      setSelectedParticipants([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleParticipant = (address: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(address)
        ? prev.filter((a) => a !== address)
        : [...prev, address],
    );
  };

  return (
    <div className="fade-in max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
      >
        <Icons.ArrowRight /> Back to Quests
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: NFT & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl overflow-hidden border border-[#6FD6F7]/30 shadow-lg">
            <div className="relative aspect-square">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-[#6FD6F7]/50">
                <span className="text-[#6FD6F7] text-xs font-bold uppercase">
                  Quest NFT
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs uppercase font-bold">
                  Reward Pool
                </span>
                <span className="text-[#6FD6F7] font-bold text-xl">
                  {event.rewardAmount} {event.rewardAsset}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs uppercase font-bold">
                  Status
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${statusBadge.bg} ${statusBadge.text}`}
                >
                  {statusBadge.label}
                </span>
              </div>
              {event.rewardPerPerson > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs uppercase font-bold">
                    Per Person
                  </span>
                  <span className="text-green-400 font-bold">
                    {event.rewardPerPerson.toFixed(4)} SUI
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Time Info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Icons.Clock /> TIME INFO
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Start</span>
                <span className="text-slate-700 font-mono text-xs">
                  {formatDate(event.startTime)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">End</span>
                <span className="text-slate-700 font-mono text-xs">
                  {formatDate(event.endTime)}
                </span>
              </div>
              {!hasEnded && event.status !== "VERIFIED" && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[#6FD6F7] text-sm font-bold">
                    ⏱ {getTimeRemaining(event.endTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Participants Info */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Icons.Users /> PARTICIPANTS
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Joined</span>
                <span className="text-slate-700 font-bold">
                  {event.currentParticipants} / {event.maxParticipants}
                </span>
              </div>
              {event.status === "VERIFIED" && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Approved</span>
                    <span className="text-green-400 font-bold">
                      {event.approvedParticipants?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Claimed</span>
                    <span className="text-blue-400 font-bold">
                      {event.claimedParticipants?.length || 0}
                    </span>
                  </div>
                </>
              )}
              {/* Progress bar */}
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6FD6F7] rounded-full transition-all"
                  style={{
                    width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Vault Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Icons.Target /> VAULT STATUS
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Vault ID</span>
                <span className="text-slate-400 font-mono text-xs">
                  {event.vaultId
                    ? `${event.vaultId.slice(0, 6)}...${event.vaultId.slice(-4)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Claimed</span>
                <span className="text-slate-700">{event.totalClaimed} SUI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
              {event.name}
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              Host:{" "}
              <span className="text-[#6FD6F7] font-mono">
                {event.creator.slice(0, 6)}...{event.creator.slice(-4)}
              </span>
              {isCreator && (
                <span className="text-xs bg-[#6FD6F7]/20 text-[#6FD6F7] px-2 py-0.5 rounded">
                  You
                </span>
              )}
            </p>
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-slate-800">Quest Description</h3>
            <p className="text-slate-600">{event.description}</p>

            <h3 className="text-slate-800 mt-6">Instructions</h3>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-slate-600 whitespace-pre-wrap">
                {event.instructions}
              </p>
            </div>
          </div>

          {/* Action Area */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-6">
            {/* Status: VERIFIED - Show claim for approved participants */}
            {event.status === "VERIFIED" && isApproved && !hasClaimed && (
              <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400">
                  <Icons.Check className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-green-600">
                    You're Approved! 🎉
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Claim your reward: {event.rewardPerPerson.toFixed(4)} SUI
                  </p>
                </div>
                <Button
                  onClick={() => onClaim(event.id, event.vaultId)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold animate-pulse"
                >
                  CLAIM REWARD NOW 🏆
                </Button>
              </div>
            )}

            {/* Status: VERIFIED - Already claimed */}
            {event.status === "VERIFIED" && hasClaimed && (
              <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 text-center">
                <Icons.Check className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <h3 className="text-xl font-bold text-blue-600">
                  Reward Claimed!
                </h3>
                <p className="text-slate-500 text-sm">
                  You've successfully claimed your reward.
                </p>
              </div>
            )}

            {/* Status: ENDED - Creator can verify */}
            {event.status === "ENDED" && isCreator && onVerify && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">
                  Verify Participants
                </h3>
                <p className="text-slate-500 text-sm">
                  Select participants who completed the quest successfully:
                </p>

                {event.participants && event.participants.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {isLoadingSubmissions && (
                      <p className="text-slate-400 text-sm text-center py-2">
                        Loading proof submissions...
                      </p>
                    )}
                    {event.participants.map((addr) => {
                      const proofUrl = getProofForParticipant(addr);
                      return (
                        <div
                          key={addr}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedParticipants.includes(addr)
                              ? "bg-green-500/10 border-green-500/50"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedParticipants.includes(addr)}
                              onChange={() => toggleParticipant(addr)}
                              className="w-4 h-4 accent-green-500"
                            />
                            <span className="font-mono text-sm text-slate-700">
                              {addr.slice(0, 6)}...{addr.slice(-4)}
                            </span>
                          </label>
                          {proofUrl ? (
                            <div className="mt-2 ml-7 flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                Proof:
                              </span>
                              <a
                                href={proofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#6FD6F7] hover:text-[#5BBCE0] underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Icons.Target className="w-3 h-3" />
                                View Proof
                              </a>
                            </div>
                          ) : (
                            <div className="mt-2 ml-7">
                              <span className="text-xs text-orange-400">
                                No proof submitted
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-4">
                    No participants joined this quest.
                  </p>
                )}

                {event.participants && event.participants.length > 0 && (
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying || selectedParticipants.length === 0}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold disabled:opacity-50"
                  >
                    {isVerifying
                      ? "Verifying..."
                      : `Approve ${selectedParticipants.length} Participant(s)`}
                  </Button>
                )}
              </div>
            )}

            {/* Status: RUNNING or PENDING - Can submit proof */}
            {(event.status === "RUNNING" || event.status === "PENDING") &&
              isJoined &&
              !isSubmitted &&
              !hasEnded && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Submit Your Proof
                  </h3>
                  <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                      type="text"
                      value={proofLink}
                      onChange={(e) => setProofLink(e.target.value)}
                      placeholder="Paste your photo proof link (Google Drive, Imgur, etc.)"
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-4 text-slate-800 focus:border-[#6FD6F7] outline-none"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#6FD6F7] hover:bg-[#5BBCE0] text-black font-bold whitespace-nowrap"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Proof"}
                    </Button>
                  </form>
                </div>
              )}

            {/* Status: RUNNING or PENDING - Already submitted */}
            {(event.status === "RUNNING" || event.status === "PENDING") &&
              isSubmitted && (
                <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 text-center">
                  <Icons.Check className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                  <h3 className="text-xl font-bold text-slate-700">
                    Proof Submitted!
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Wait for the event to end and creator verification.
                  </p>
                </div>
              )}

            {/* Status: PENDING or RUNNING - Can join */}
            {(event.status === "PENDING" || event.status === "RUNNING") &&
              !isJoined &&
              !isCreator &&
              canJoin && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Join This Quest
                  </h3>
                  <Button
                    onClick={() => onJoin(event.id)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    <Icons.Flag /> Join Quest & Start Your Mission
                  </Button>
                </div>
              )}

            {/* Status: VERIFIED - Submitted but NOT Approved */}
            {event.status === "VERIFIED" &&
              isSubmitted &&
              !isApproved &&
              !hasClaimed && (
                <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-400 mb-2">
                    <Icons.XCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-red-600">
                    Not Approved ✗
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Sorry, you were not approved for the reward.
                  </p>
                </div>
              )}

            {/* Status: ENDED (Pending Verification) - Submitted */}
            {hasEnded &&
              event.status !== "VERIFIED" &&
              isSubmitted &&
              !isApproved && (
                <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20 text-center">
                  <Icons.Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <h3 className="text-xl font-bold text-yellow-600">
                    Pending Verification
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Your submission is being reviewed by the host.
                  </p>
                </div>
              )}

            {/* Event Ended (Time passed) - Generic message for those who didn't submit */}
            {hasEnded &&
              event.status !== "VERIFIED" &&
              !isCreator &&
              !isSubmitted && (
                <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20 text-center">
                  <Icons.Clock className="w-8 h-8 mx-auto text-orange-400 mb-2" />
                  <h3 className="text-xl font-bold text-slate-700">
                    Quest Ended
                  </h3>
                  <p className="text-slate-500 text-sm">
                    This quest has ended. Rewards are being distributed.
                  </p>
                </div>
              )}

            {/* Event Full */}
            {!canJoin &&
              !isJoined &&
              !hasEnded &&
              event.status !== "VERIFIED" &&
              event.status !== "ENDED" && (
                <div className="bg-slate-100 p-4 rounded-xl text-center border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-600">
                    Quest Full
                  </h3>
                  <p className="text-slate-500">
                    Maximum participants reached ({event.maxParticipants}).
                  </p>
                </div>
              )}

            {/* Waiting for event to start - REMOVED per requirement to treat PENDING as RUNNING */}
          </div>

          {/* Participants List */}
          {event.participants && event.participants.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                Participants{" "}
                <span className="text-slate-500 text-sm font-normal">
                  ({event.participants.length})
                </span>
              </h3>
              <div className="space-y-3">
                {event.participants.slice(0, 5).map((addr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-mono text-slate-600">
                        {addr.slice(2, 4)}
                      </div>
                      <p className="text-sm font-mono text-slate-600">
                        {addr.slice(0, 8)}...{addr.slice(-6)}
                      </p>
                    </div>
                    {event.approvedParticipants?.includes(addr) ? (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-600">
                        Approved
                      </span>
                    ) : event.claimedParticipants?.includes(addr) ? (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-600">
                        Claimed
                      </span>
                    ) : event.status === "VERIFIED" ? (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-600">
                        Not Approved
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-600">
                        Joined
                      </span>
                    )}
                  </div>
                ))}
                {event.participants.length > 5 && (
                  <p className="text-sm text-slate-400 text-center">
                    +{event.participants.length - 5} more participants
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
