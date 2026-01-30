// Event status types matching smart contract
export type EventStatus = "PENDING" | "RUNNING" | "ENDED" | "VERIFIED";

// Status code mapping from smart contract
export const STATUS_CODES: Record<number, EventStatus> = {
  0: "PENDING",
  1: "RUNNING",
  2: "ENDED",
  3: "VERIFIED",
};

export interface Event {
  id: string;
  name: string;
  creator: string;
  description: string;
  instructions: string;
  imageUrl: string;

  // Reward info
  rewardAmount: number;
  rewardAsset: "SUI";
  rewardPerPerson: number;
  totalClaimed: number;

  // Status & timing
  status: EventStatus;
  startTime: number;
  endTime: number;

  // Participant limits
  maxParticipants: number;
  currentParticipants: number;

  // Participant tracking
  participants: string[];
  approvedParticipants: string[];
  claimedParticipants: string[];

  // References
  vaultId: string;
  createdAt: number;
}

export interface Submission {
  id: string;
  eventId: string;
  submitter: string;
  proofUrl: string;
  timestamp: number;
  status: "PENDING" | "VALID" | "REJECTED";
}

export interface WalletState {
  address: string;
  suiBalance: number;
  lifeBalance: number;
}
