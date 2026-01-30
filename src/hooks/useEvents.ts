import { useQueryClient } from "@tanstack/react-query";
import { useSuiClientQuery } from "@mysten/dapp-kit";
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
    if (typeof bytes === "string") return bytes;
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

export const useEvents = (ownerAddress: string | null) => {
  const queryClient = useQueryClient();

  const {
    data: ownedObjects,
    isPending: isLoading,
    error,
    refetch: refreshEvents,
  } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: ownerAddress || "",
      filter: {
        StructType: `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::event::EventNFT`,
      },
      options: {
        showContent: true,
        showDisplay: true,
      },
    },
    {
      enabled: !!ownerAddress,
      staleTime: 10000,
      refetchInterval: 10000,
    },
  );

  // Parse events from the query result
  const events: Event[] =
    ownedObjects?.data
      ?.map((obj: any) => {
        const content = obj.data?.content;

        if (!content) return null;

        const fields = content.fields;

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

          // Status & timing
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
          claimedParticipants: parseAddressArray(fields?.claimed_participants),

          // References
          vaultId: fields?.vault_id || "",
          createdAt: Date.now(),
        };
      })
      .filter((event: Event | null): event is Event => event !== null) || [];

  return {
    events,
    isLoading,
    error,
    refreshEvents,
  };
};
