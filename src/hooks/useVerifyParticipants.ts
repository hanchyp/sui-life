import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG } from "@/config/contract";

interface VerifyParticipantsData {
  eventId: string;
  approvedAddresses: string[];
}

interface UseVerifyParticipantsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: (message: string, type: "success" | "error") => void;
}

export const useVerifyParticipants = (
  options?: UseVerifyParticipantsOptions,
) => {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async (data: VerifyParticipantsData) => {
      if (!currentAccount) {
        throw new Error("Please connect your wallet first");
      }

      if (data.approvedAddresses.length === 0) {
        throw new Error("Please select at least one participant to approve");
      }

      const tx = new Transaction();

      // Call verify_participants(event, approved_addresses, clock, ctx)
      tx.moveCall({
        target: `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${CONTRACT_CONFIG.FUNCTIONS.VERIFY_PARTICIPANTS}`,
        arguments: [
          tx.object(data.eventId),
          tx.pure.vector("address", data.approvedAddresses),
          tx.object("0x6"), // Sui Clock object
        ],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      return result;
    },
    onSuccess: async () => {
      options?.showToast?.(
        "Participants verified successfully! They can now claim rewards.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["getOwnedObjects"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error verifying participants:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to verify participants.";
      options?.showToast?.(errorMessage, "error");
      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage),
      );
    },
  });
};
