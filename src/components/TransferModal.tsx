import React from 'react';
import { Hero } from '@/types';

interface TransferModalProps {
  hero: Hero;
  transferAddress: string;
  transferStep: 'input' | 'confirm';
  onAddressChange: (address: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  hero,
  transferAddress,
  transferStep,
  onAddressChange,
  onConfirm,
  onCancel,
  onBack,
  isLoading = false
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative glass w-full max-w-md overflow-hidden rounded-2xl border border-white/10 shadow-2xl fade-in">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 bg-slate-900/50">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {transferStep === 'input' ? 'Transfer Asset' : 'Confirm Transfer'}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {transferStep === 'input' 
              ? 'Initiate transfer protocol for your hero.' 
              : 'Review transaction details before execution.'}
          </p>
        </div> 

        {/* Hero Visual Representation */}
        <div className="p-6 bg-slate-950/30 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-inner">
            <img src={hero.imageUrl} alt={hero.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-sm font-bold text-white uppercase tracking-wide">{hero.name}</div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{hero.class} • LVL {hero.stats.level}</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {transferStep === 'input' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination Address</label>
              <input
                type="text"
                autoFocus
                value={transferAddress}
                onChange={(e) => onAddressChange(e.target.value)}
                placeholder="Enter Sui 0x address..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <p className="text-[9px] text-slate-600 font-medium">Verify address carefully. Assets sent to incorrect addresses cannot be recovered.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Recipient</div>
                <div className="text-xs font-mono text-slate-200 break-all bg-slate-950/50 p-2 rounded border border-white/5">
                  {transferAddress}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <span className="text-red-400 text-xs mt-0.5">⚠️</span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  Final Confirmation: You are transferring full ownership of <span className="text-white font-bold">{hero.name}</span>. This unit will be removed from your ledger immediately.
                </p>
              </div>
            </div>
          )} 

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={transferStep === 'input' ? onCancel : onBack}
              className="flex-1 py-3 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
            >
              {transferStep === 'input' ? 'Cancel' : 'Back'}
            </button>
            <button
              disabled={!transferAddress || isLoading}
              onClick={transferStep === 'input' ? onBack : onConfirm}
              className={`flex-[2] py-3 rounded-lg text-white font-bold text-xs transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2 ${
                transferStep === 'input' 
                ? 'bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:opacity-50' 
                : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 disabled:bg-red-900 disabled:opacity-50'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{transferStep === 'input' ? 'Preview' : 'Transfer'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};