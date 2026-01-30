// Contract configuration
export const CONTRACT_CONFIG = {
  // Update this with your actual deployed package ID from testnet
  EVENT_PACKAGE_ID:
    "0xc85ffd81036b609af85cd07439a8ed01ccb6a3db6cd2f2012c29d4145dbab00d", // Deployed package ID
  TOKEN_PACKAGE_ID:
    "0x69f585ff94a49807d1b385d7e05a08cc01f5622ade69fee17aa6d885b545b0a6", // 🔥 REPLACE with Token Package ID
  MODULE_NAME: "event",
  TOKEN_MODULE_NAME: "life_token",

  // Shared Objects for Token (🔥 REPLACE with IDs from deployment output)
  TOKEN_VAULT_ID:
    "0x00104f5a420a79eca615fadfb70ec13b01dc0bf40b7d981c4f72367db0237b39",
  TOKEN_PRICE_ID:
    "0xfc987b77613037aed65358049cecfff660a0d074508df739901539884045b244",
  TOKEN_STATE_ID:
    "0x393bff9c8ea482a01bbd911a7c0724f2a6f758c26837c72c8428322204b6088e",

  // Network configuration
  NETWORK: "testnet",

  // Contract functions
  FUNCTIONS: {
    CREATE_EVENT: "create_event",
    CLAIM_REWARD: "claim_reward",
    BUY_RUN: "buy_life",
    JOIN_EVENT: "join_event",
    SUBMIT_PROOF: "submit_proof",
    VERIFY_PARTICIPANTS: "verify_participants",
  },
};

// Helper to get full function target
export const getFunctionTarget = (functionName: string) => {
  return `${CONTRACT_CONFIG.EVENT_PACKAGE_ID}::${CONTRACT_CONFIG.MODULE_NAME}::${functionName}`;
};
