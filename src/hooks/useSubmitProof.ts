import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG } from "@/config/contract";

interface SubmitProofData {
  eventId: string;
  proof: string;
}

interface UseSubmitProofOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: (message: string, type: "success" | "error") => void;
}

export const useSubmitProof = (options?: UseSubmitProofOptions) => {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async (data: SubmitProofData) => {
      if (!currentAccount) {
        throw new Error("Please connect your wallet first");
      }

      const tx = new Transaction();

      // Convert string proof to vector<u8> (byte array)
      const proofBytes = new TextEncoder().encode(data.proof);

      // Call submit_proof(event, proof, ctx)
      tx.moveCall({
        target: `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${CONTRACT_CONFIG.FUNCTIONS.SUBMIT_PROOF}`,
        arguments: [
          tx.object(data.eventId),
          tx.pure.vector("u8", proofBytes),
          tx.object("0x6"), // Clock object
        ],
      });

      // Submission object transfer is handled in Move function

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      return result;
    },
    onSuccess: async () => {
      options?.showToast?.("Proof submitted successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["getOwnedObjects"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error submitting proof:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit proof.";
      options?.showToast?.(errorMessage, "error");
      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage),
      );
    },
  });
};
