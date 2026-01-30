import React, { useState } from "react";
import { Button } from "./Button";
import { Icons } from "@/constants";
import { LoadingSpinner } from "./LoadingSpinner";

interface BuyLifeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: (amount: number) => Promise<void>;
  suiBalance: number;
}

export const BuyLifeModal: React.FC<BuyLifeModalProps> = ({
  isOpen,
  onClose,
  onBuy,
  suiBalance,
}) => {
  const [amount, setAmount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleBuy = async () => {
    setIsLoading(true);
    await onBuy(amount);
    setIsLoading(false);
    onClose();
  };

  const lifeRate = 1000; // 1 SUI = 1000 LIFE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#6FD6F7] flex items-center justify-center text-black text-xs font-bold">
            $
          </span>
          Buy LIFE Tokens
        </h3>

        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-600">Pay with SUI</label>
              <span className="text-xs text-slate-500">
                Balance: {suiBalance.toFixed(3)} SUI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                step="0.001"
                min="0.001"
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-2xl font-bold text-slate-800 outline-none w-full"
              />
              <div className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded-lg">
                <span className="w-4 h-4 rounded-full bg-blue-500"></span>
                <span className="font-bold text-sm text-slate-700">SUI</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-500">
            <Icons.ArrowRight className="rotate-90" />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between mb-2">
              <label className="text-sm text-slate-600">Receive LIFE</label>
              <span className="text-xs text-slate-500">
                Rate: 0.001 SUI = 1 LIFE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount * lifeRate}
                disabled
                className="bg-transparent text-2xl font-bold text-[#6FD6F7] outline-none w-full"
              />
              <div className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded-lg">
                <span className="w-4 h-4 rounded-full bg-[#6FD6F7]"></span>
                <span className="font-bold text-sm text-slate-700">LIFE</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleBuy}
            disabled={isLoading || amount <= 0 || amount > suiBalance}
            className="w-full bg-[#6FD6F7] hover:bg-[#5BBCE0] text-black font-extrabold uppercase py-4 rounded-xl"
          >
            {isLoading ? <LoadingSpinner size="small" /> : "Confirm Swap"}
          </Button>
        </div>
      </div>
    </div>
  );
};
