import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { CONTRACT_CONFIG } from "@/config/contract";

export interface EventSubmission {
  id: string;
  eventId: string;
  submitter: string;
  proofUrl: string;
  timestamp: number;
}

// Helper to parse strings from Move vector<u8> or String struct
const bytesToString = (data: any): string => {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data))
    return new TextDecoder().decode(new Uint8Array(data));
  if (data?.fields?.bytes) {
    const bytes = data.fields.bytes;
    if (typeof bytes === "string") return bytes;
    if (Array.isArray(bytes))
      return new TextDecoder().decode(new Uint8Array(bytes));
  }
  if (data?.bytes) {
    return new TextDecoder().decode(new Uint8Array(data.bytes));
  }
  return "";
};

/**
 * Hook to fetch all submissions for a specific event
 * Used by event creators to view proofs submitted by participants
 */
export const useEventSubmissions = (eventId: string | null) => {
  const suiClient = useSuiClient();

  const submissionType = `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::Submission`;

  const {
    data: submissions,
    isPending: isLoading,
    error,
    refetch: refreshSubmissions,
  } = useQuery({
    queryKey: ["eventSubmissions", eventId, submissionType],
    queryFn: async () => {
      if (!eventId) return [];

      try {
        // Query all transactions that called submit_proof for this event
        const txBlocks = await suiClient.queryTransactionBlocks({
          filter: {
            MoveFunction: {
              package: CONTRACT_CONFIG.EVENT_PACKAGE_ID,
              module: CONTRACT_CONFIG.MODULE_NAME,
              function: CONTRACT_CONFIG.FUNCTIONS.SUBMIT_PROOF,
            },
          },
          options: {
            showObjectChanges: true,
            showInput: true,
          },
          limit: 100,
        });

        console.log("Found", txBlocks.data.length, "submit_proof transactions");

        // Extract Submission object IDs from transactions that involve this event
        const submissionObjectIds: string[] = [];

        for (const tx of txBlocks.data) {
          if (tx.objectChanges) {
            for (const change of tx.objectChanges) {
              if (
                change.type === "created" &&
                change.objectType === submissionType
              ) {
                submissionObjectIds.push(change.objectId);
              }
            }
          }
        }

        console.log(
          "Found",
          submissionObjectIds.length,
          "Submission objects:",
          submissionObjectIds,
        );

        if (submissionObjectIds.length === 0) {
          console.log("No submissions found for any event");
          return [];
        }

        // Fetch all Submission objects
        const objectResponses = await suiClient.multiGetObjects({
          ids: submissionObjectIds,
          options: {
            showContent: true,
          },
        });

        // Parse submissions and filter by eventId
        const parsedSubmissions: EventSubmission[] = objectResponses
          .filter((obj) => obj.data?.content)
          .map((obj) => {
            const content = obj.data?.content;
            if (!content || content.dataType !== "moveObject") return null;

            const fields = (content as any).fields;

            // event_id from Move can be a string or an object { id: "0x..." }
            let submissionEventId = fields?.event_id;
            if (
              typeof submissionEventId === "object" &&
              submissionEventId?.id
            ) {
              submissionEventId = submissionEventId.id;
            }

            console.log("Submission found:", {
              submissionEventId,
              eventId,
              participant: fields?.participant,
              proofRaw: fields?.proof,
              match: submissionEventId === eventId,
            });

            // Only include submissions for this specific event
            if (submissionEventId !== eventId) return null;

            return {
              id: obj.data?.objectId || "",
              eventId: submissionEventId,
              submitter: fields?.participant || "",
              proofUrl: bytesToString(fields?.proof),
              timestamp: 0,
            };
          })
          .filter((sub): sub is EventSubmission => sub !== null);

        console.log(
          "Total parsed submissions for event",
          eventId,
          ":",
          parsedSubmissions.length,
        );
        return parsedSubmissions;
      } catch (err) {
        console.error("Error fetching event submissions:", err);
        throw err;
      }
    },
    enabled: !!eventId,
    staleTime: 10000,
    refetchInterval: 15000,
  });

  return {
    submissions: submissions || [],
    isLoading,
    error,
    refreshSubmissions,
  };
};
