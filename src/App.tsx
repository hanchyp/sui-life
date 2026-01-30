import React, { useState } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import {
  EventList,
  CreateEventForm,
  Navigation,
  WalletConnect,
  ToastContainer,
  EventDetail,
  BuyLifeModal,
  Dashboard,
} from "@/components";
import {
  useAllEvents,
  useCreateEvent,
  useToast,
  useClaimReward,
  useBuyLife,
  useJoinEvent,
  useSubmitProof,
  useUserParticipation,
  useVerifyParticipants,
} from "@/hooks";
import { Icons } from "@/constants";
import { CONTRACT_CONFIG } from "@/config/contract";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"events" | "create" | "dashboard">(
    "events",
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isBuyLifeModalOpen, setIsBuyLifeModalOpen] = useState(false);

  const currentAccount = useCurrentAccount();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // useAllEvents: Fetch ALL events from blockchain (for EventList)
  const {
    events: allEvents,
    isLoading: isAllEventsLoading,
    refreshEvents: refreshAllEvents,
  } = useAllEvents();

  // Filter allEvents to get only events created by current user (for Dashboard)
  const myEvents = allEvents.filter(
    (event) => event.creator === currentAccount?.address,
  );

  const {
    joinedEventIds,
    submittedEventIds,
    participantObjects,
    submissionObjects,
    refetch: refreshParticipation,
  } = useUserParticipation();

  // Fetch SUI Balance
  const { data: balanceData } = useSuiClientQuery(
    "getBalance",
    {
      owner: currentAccount?.address || "",
    },
    {
      enabled: !!currentAccount,
      refetchInterval: 5000,
    },
  );

  const suiBalance = balanceData
    ? Number(balanceData.totalBalance) / 1_000_000_000
    : 0;

  // Fetch LIFE Balance
  const { data: lifeBalanceData } = useSuiClientQuery(
    "getBalance",
    {
      owner: currentAccount?.address || "",
      coinType: `${CONTRACT_CONFIG.TOKEN_PACKAGE_ID}::${CONTRACT_CONFIG.TOKEN_MODULE_NAME}::LIFE_TOKEN`,
    },
    {
      enabled: !!currentAccount,
      refetchInterval: 5000,
    },
  );

  const lifeBalance = lifeBalanceData
    ? Number(lifeBalanceData.totalBalance) / 1_000_000_000
    : 0;

  const handleRefresh = async () => {
    // Wait for node indexing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await Promise.all([refreshAllEvents(), refreshParticipation()]);
  };

  const createEventMutation = useCreateEvent({
    onSuccess: async () => {
      setActiveTab("events");
      showSuccess(
        "Quest created successfully! Participants can now join and take action.",
      );
      await handleRefresh();
    },
    showToast: (message, type) => {
      if (type === "success") {
        showSuccess(message);
      } else {
        showError(message);
      }
    },
  });

  const claimRewardMutation = useClaimReward({
    onSuccess: async () => {
      showSuccess("Reward claimed successfully! Quest completed.");
      await handleRefresh();
    },
    showToast: (message, type) => {
      if (type === "success") showSuccess(message);
      else showError(message);
    },
  });

  const verifyParticipantsMutation = useVerifyParticipants({
    onSuccess: async () => {
      showSuccess("Participants verified! They can now claim their rewards.");
      await handleRefresh();
    },
    showToast: (message, type) => {
      if (type === "success") showSuccess(message);
      else showError(message);
    },
  });

  const handleCreateEvent = async (data: any) => {
    if (!currentAccount) {
      showError("Please connect your wallet first");
      return;
    }
    await createEventMutation.mutateAsync(data);
  };

  const handleJoinEvent = (id: string) => {
    if (!currentAccount) {
      showError("Please connect wallet to join quest");
      return;
    }
    setSelectedEventId(id);
  };

  const { mutateAsync: buyLife } = useBuyLife({
    onSuccess: () => {
      // Success toast is handled in hook
    },
    showToast: (message, type) => {
      if (type === "success") showSuccess(message);
      else showError(message);
    },
  });

  const joinEventMutation = useJoinEvent({
    onSuccess: async () => {
      showSuccess("You've joined the quest! Now complete the mission.");
      await handleRefresh();
    },
    showToast: (m, t) => (t === "success" ? showSuccess(m) : showError(m)),
  });

  const submitProofMutation = useSubmitProof({
    onSuccess: async () => {
      showSuccess("Proof submitted! Waiting for verification.");
      await handleRefresh();
    },
    showToast: (m, t) => (t === "success" ? showSuccess(m) : showError(m)),
  });

  const handleBuyLife = async (amount: number) => {
    if (!currentAccount) {
      showError("Please connect your wallet first");
      return;
    }
    await buyLife({ amountSui: amount });
  };

  const handleVerifyParticipants = async (
    eventId: string,
    approvedAddresses: string[],
  ) => {
    if (!currentAccount) {
      showError("Please connect your wallet first");
      return;
    }
    await verifyParticipantsMutation.mutateAsync({
      eventId,
      approvedAddresses,
    });
  };

  const selectedEvent = allEvents.find((e) => e.id === selectedEventId);

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setActiveTab("events");
              setSelectedEventId(null);
            }}
          >
            <img src="/logo.png" alt="SuiLife Logo" className="w-14 h-14" />
            <span className="text-lg font-extrabold tracking-tight text-slate-800 uppercase italic">
              <span className="text-[#6FD6F7]">Sui </span>Life
            </span>
          </div>

          <Navigation
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setSelectedEventId(null);
            }}
            onBuyLife={() => setIsBuyLifeModalOpen(true)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Network: Testnet
            </span>
            {currentAccount && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] font-mono text-slate-700">
                  {currentAccount.address.slice(0, 6)}...
                  {currentAccount.address.slice(-4)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#1F7F9E]">
                    {suiBalance.toFixed(3)} SUI
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#6FD6F7]">
                    {lifeBalance.toFixed(2)} LIFE
                  </span>
                </div>
              </div>
            )}
          </div>
          <WalletConnect />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {selectedEventId && selectedEvent ? (
          <EventDetail
            event={selectedEvent}
            onBack={() => setSelectedEventId(null)}
            onJoin={(eventId) => {
              joinEventMutation.mutateAsync({ eventId });
            }}
            onSubmitProof={(eventId, proof, participantId) => {
              submitProofMutation.mutateAsync({
                eventId,
                proof,
              });
            }}
            onClaim={(eventId, vaultId) => {
              const submissionId = submissionObjects[eventId];
              if (submissionId) {
                claimRewardMutation.mutateAsync({
                  eventId,
                  vaultId,
                  submissionId,
                });
              } else {
                showError("Submission ID not found. Cannot claim.");
              }
            }}
            onVerify={handleVerifyParticipants}
            userAddress={currentAccount?.address}
            isJoined={joinedEventIds.includes(selectedEvent.id)}
            isSubmitted={submittedEventIds.includes(selectedEvent.id)}
            participantObjectId={participantObjects[selectedEvent.id]}
          />
        ) : (
          <>
            {activeTab === "events" && (
              <EventList
                events={allEvents}
                joinedEventIds={joinedEventIds}
                submittedEventIds={submittedEventIds}
                onJoin={handleJoinEvent}
                onCreateClick={() => setActiveTab("create")}
              />
            )}

            {activeTab === "create" && (
              <div className="py-12">
                <CreateEventForm
                  onCreate={handleCreateEvent}
                  isLoading={createEventMutation.isPending}
                  lifeBalance={lifeBalance}
                />
              </div>
            )}

            {activeTab === "dashboard" && (
              <Dashboard
                currentAccount={currentAccount?.address || null}
                myEvents={myEvents || []}
                joinedEvents={
                  allEvents?.filter((e) => joinedEventIds.includes(e.id)) || []
                }
                submittedEventIds={submittedEventIds}
                submissionObjects={submissionObjects}
                onClaim={(eventId, vaultId, submissionId) => {
                  if (submissionId) {
                    claimRewardMutation.mutateAsync({
                      eventId,
                      vaultId,
                      submissionId,
                    });
                  } else {
                    showError("Submission ID not found. Cannot claim.");
                  }
                }}
                onViewEvent={(event) => {
                  setSelectedEventId(event.id);
                }}
                onVerify={(event) => {
                  setSelectedEventId(event.id);
                }}
              />
            )}
          </>
        )}
      </main>

      <BuyLifeModal
        isOpen={isBuyLifeModalOpen}
        onClose={() => setIsBuyLifeModalOpen(false)}
        onBuy={handleBuyLife}
        suiBalance={suiBalance}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default App;
