import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG } from "@/config/contract";

interface ClaimRewardData {
  eventId: string;
  vaultId: string;
}

interface UseClaimRewardOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: (message: string, type: "success" | "error") => void;
}

export const useClaimReward = (options?: UseClaimRewardOptions) => {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async (data: ClaimRewardData) => {
      if (!currentAccount) {
        throw new Error("Please connect your wallet first");
      }

      const tx = new Transaction();

      // Call claim_reward(event, vault, ctx) - ctx is automatic
      tx.moveCall({
        target: `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${CONTRACT_CONFIG.FUNCTIONS.CLAIM_REWARD}`,
        arguments: [tx.object(data.eventId), tx.object(data.vaultId)],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      return result;
    },
    onSuccess: async () => {
      options?.showToast?.("Reward claimed successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["getOwnedObjects"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error claiming reward:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to claim reward.";
      options?.showToast?.(errorMessage, "error");
      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage),
      );
    },
  });
};
