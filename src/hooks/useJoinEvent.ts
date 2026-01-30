import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG } from "@/config/contract";

interface JoinEventData {
  eventId: string;
}

interface UseJoinEventOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: (message: string, type: "success" | "error") => void;
}

export const useJoinEvent = (options?: UseJoinEventOptions) => {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async (data: JoinEventData) => {
      if (!currentAccount) {
        throw new Error("Please connect your wallet first");
      }

      const tx = new Transaction();

      // Call join_event(event, ctx)
      tx.moveCall({
        target: `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${CONTRACT_CONFIG.FUNCTIONS.JOIN_EVENT}`,
        arguments: [
          tx.object(data.eventId),
          tx.object("0x6"), // Clock object
        ],
      });

      // Object transfer is handled in Move function

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      return result;
    },
    onSuccess: async () => {
      options?.showToast?.("Successfully joined event!", "success");
      queryClient.invalidateQueries({ queryKey: ["getOwnedObjects"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error joining event:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to join event.";
      options?.showToast?.(errorMessage, "error");
      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage),
      );
    },
  });
};
