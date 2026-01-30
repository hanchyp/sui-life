import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { Event, STATUS_CODES, EventStatus } from "@/types";
import { CONTRACT_CONFIG } from "@/config/contract";

// Helper to parse strings from Move vector<u8>
// Helper to parse strings from Move vector<u8> or String struct
const bytesToString = (data: any): string => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data))
    return new TextDecoder().decode(new Uint8Array(data));
  if (data?.fields?.bytes) {
    // Handle 0x1::string::String struct
    const bytes = data.fields.bytes;
    if (typeof bytes === "string") return bytes; // Sometimes returned as string if not bytes
    if (Array.isArray(bytes))
      return new TextDecoder().decode(new Uint8Array(bytes));
  }
  if (data?.bytes) {
    // Handle simplified view
    return new TextDecoder().decode(new Uint8Array(data.bytes));
  }
  return "";
};

// Helper to parse address array from Move vector<address>
const parseAddressArray = (data: any): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [];
};

// Helper to convert status code to EventStatus
const parseStatus = (statusCode: any): EventStatus => {
  const code = Number(statusCode) || 0;
  return STATUS_CODES[code] || "PENDING";
};

// Helper to derive effective status based on time
const deriveEffectiveStatus = (
  onChainStatus: EventStatus,
  startTime: number,
  endTime: number,
): EventStatus => {
  const now = Date.now();

  // If already VERIFIED, keep it
  if (onChainStatus === "VERIFIED") return "VERIFIED";

  // If end time has passed, show as ENDED
  if (endTime > 0 && now > endTime) return "ENDED";

  // If start time has passed but not ended, show as RUNNING
  if (startTime > 0 && now >= startTime && now <= endTime) return "RUNNING";

  // Otherwise use on-chain status
  return onChainStatus;
};

/**
 * Hook untuk mengambil SEMUA Event yang ada di blockchain
 * Berbeda dengan useEvents yang hanya mengambil event milik user yang login
 */
export const useAllEvents = () => {
  const suiClient = useSuiClient();

  const eventType = `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::event::Event`;

  const {
    data: events,
    isPending: isLoading,
    error,
    refetch: refreshEvents,
  } = useQuery({
    queryKey: ["allEvents", eventType],
    queryFn: async () => {
      try {
        // Query semua transaksi yang memanggil create_event
        const txBlocks = await suiClient.queryTransactionBlocks({
          filter: {
            MoveFunction: {
              package: CONTRACT_CONFIG.EVENT_PACKAGE_ID,
              module: "event",
              function: "create_event",
            },
          },
          options: {
            showObjectChanges: true,
          },
          limit: 50,
        });

        // Extract Event object IDs from transaction results
        // Shared objects appear as 'created' with objectType matching our Event
        const eventObjectIds: string[] = [];

        for (const tx of txBlocks.data) {
          if (tx.objectChanges) {
            for (const change of tx.objectChanges) {
              if (
                change.type === "created" &&
                change.objectType === eventType
              ) {
                eventObjectIds.push(change.objectId);
              }
            }
          }
        }

        if (eventObjectIds.length === 0) {
          return [];
        }

        // Fetch all Event objects by their IDs
        const objectResponses = await suiClient.multiGetObjects({
          ids: eventObjectIds,
          options: {
            showContent: true,
            showDisplay: true,
            showOwner: true,
          },
        });

        // Parse events from object responses
        const parsedEvents: Event[] = objectResponses
          .filter((obj) => obj.data?.content)
          .map((obj) => {
            const content = obj.data?.content;
            if (!content || content.dataType !== "moveObject") return null;

            const fields = (content as any).fields;

            const startTime = Number(fields?.start_time || 0);
            const endTime = Number(fields?.end_time || 0);
            const onChainStatus = parseStatus(fields?.status);

            return {
              id: obj.data?.objectId || "",
              name: bytesToString(fields?.name) || "Unknown Event",
              creator: fields?.creator || "",
              description: bytesToString(fields?.description) || "",
              instructions: bytesToString(fields?.instructions) || "",
              imageUrl: bytesToString(fields?.image_url) || "",

              // Reward info
              rewardAmount: Number(fields?.reward_amount || 0) / 1_000_000_000,
              rewardAsset: "SUI" as const,
              rewardPerPerson:
                Number(fields?.reward_per_person || 0) / 1_000_000_000,
              totalClaimed: Number(fields?.total_claimed || 0) / 1_000_000_000,

              // Status & timing - derive effective status based on time
              status: deriveEffectiveStatus(onChainStatus, startTime, endTime),
              startTime,
              endTime,

              // Participant limits
              maxParticipants: Number(fields?.max_participants || 0),
              currentParticipants: Number(fields?.current_participants || 0),

              // Participant tracking
              participants: parseAddressArray(fields?.participants),
              approvedParticipants: parseAddressArray(
                fields?.approved_participants,
              ),
              claimedParticipants: parseAddressArray(
                fields?.claimed_participants,
              ),

              // References
              vaultId: fields?.vault_id || "",
              createdAt: Date.now(),
            };
          })
          .filter((event): event is Event => event !== null);

        return parsedEvents;
      } catch (err) {
        console.error("Error fetching all events:", err);
        throw err;
      }
    },
    staleTime: 10000,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  return {
    events: events || [],
    isLoading,
    error,
    refreshEvents,
  };
};
