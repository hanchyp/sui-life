import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { CONTRACT_CONFIG } from "@/config/contract";

interface CreateEventData {
  name: string;
  description: string;
  instructions: string;
  rewardAmount: number;
  rewardAsset: "SUI";
  imageUrl: string;
  startTime: string; // ISO datetime-local string
  endTime: string;
  maxParticipants: number;
}

interface UseCreateEventOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showToast?: (message: string, type: "success" | "error") => void;
}

const LIFE_COIN_TYPE = `${CONTRACT_CONFIG.TOKEN_PACKAGE_ID}::${CONTRACT_CONFIG.TOKEN_MODULE_NAME}::LIFE_TOKEN`;
const EVENT_FEE_AMOUNT = 10_000_000_000n; // 10 LIFE with 9 decimals

export const useCreateEvent = (options?: UseCreateEventOptions) => {
  const queryClient = useQueryClient();
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();

  return useMutation({
    mutationFn: async (data: CreateEventData) => {
      if (!currentAccount) {
        throw new Error("Please connect your wallet first");
      }

      // Fetch User's LIFE Coins
      const { data: lifeCoins } = await client.getCoins({
        owner: currentAccount.address,
        coinType: LIFE_COIN_TYPE,
      });

      if (lifeCoins.length === 0) {
        throw new Error(
          "You do not have any LIFE tokens to pay the event fee (10 LIFE).",
        );
      }

      // Calculate total balance of LIFE
      const totalLifeBalance = lifeCoins.reduce(
        (acc, coin) => acc + BigInt(coin.balance),
        0n,
      );
      if (totalLifeBalance < EVENT_FEE_AMOUNT) {
        throw new Error(
          "Insufficient LIFE balance. You need 10 LIFE to create an event.",
        );
      }

      // Convert datetime strings to timestamps (milliseconds)
      const startTimeMs = new Date(data.startTime).getTime();
      const endTimeMs = new Date(data.endTime).getTime();

      // Validate times
      const now = Date.now();
      if (startTimeMs < now) {
        throw new Error("Start time must be in the future");
      }
      if (endTimeMs <= startTimeMs) {
        throw new Error("End time must be after start time");
      }

      const tx = new Transaction();

      // Handle LIFE Fee Payment
      let primaryCoinInput;
      if (lifeCoins.length > 1) {
        // Merge coins if multiple
        const primaryCoinId = lifeCoins[0].coinObjectId;
        const coinsToMerge = lifeCoins.slice(1).map((c) => c.coinObjectId);

        const mergeTx = new Transaction();
        mergeTx.mergeCoins(
          mergeTx.object(primaryCoinId),
          coinsToMerge.map((id) => mergeTx.object(id)),
        );
        await signAndExecuteTransaction({ transaction: mergeTx });

        primaryCoinInput = tx.object(primaryCoinId);
      } else {
        primaryCoinInput = tx.object(lifeCoins[0].coinObjectId);
      }

      // Split 10 LIFE for the fee
      const [feeCoin] = tx.splitCoins(primaryCoinInput, [
        tx.pure.u64(EVENT_FEE_AMOUNT),
      ]);

      // Calculate reward amount in MIST (9 decimals for SUI)
      const rewardInMist = BigInt(
        Math.floor(data.rewardAmount * 1_000_000_000),
      );

      // Split SUI Payment for Reward
      const [rewardCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(rewardInMist)]);

      // Call create_event with full parameters
      tx.moveCall({
        target: `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${CONTRACT_CONFIG.FUNCTIONS.CREATE_EVENT}`,
        arguments: [
          tx.pure.string(data.name),
          tx.pure.string(data.description),
          tx.pure.string(data.instructions),
          tx.pure.string(data.imageUrl),
          tx.pure.u64(rewardInMist),
          tx.pure.u64(startTimeMs),
          tx.pure.u64(endTimeMs),
          tx.pure.u64(data.maxParticipants),
          rewardCoin,
          feeCoin,
        ],
      });

      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      return result;
    },
    onSuccess: async () => {
      options?.showToast?.(
        "Event created successfully! Fee paid & Reward locked.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["getOwnedObjects"] });
      queryClient.invalidateQueries({ queryKey: ["getBalance"] });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event.";
      options?.showToast?.(errorMessage, "error");
      options?.onError?.(
        error instanceof Error ? error : new Error(errorMessage),
      );
    },
  });
};
