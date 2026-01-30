import React from 'react';
import { Hero } from '@/types';
import { Icons, XP_PER_LEVEL } from '@/constants';

interface HeroCardProps {
  hero: Hero;
  onTrain?: (id: string) => void;
  onTransfer?: (id: string) => void;
  isTraining?: boolean;
  justLeveledUp?: boolean;
}

export const HeroCard: React.FC<HeroCardProps> = ({ 
  hero, 
  onTrain, 
  onTransfer, 
  isTraining, 
  justLeveledUp 
}) => {
  const xpProgress = (hero.stats.xp % XP_PER_LEVEL);
  const xpPercent = (xpProgress / XP_PER_LEVEL) * 100;

  return (
    <div className={`group flex flex-col bg-slate-900/40 rounded-2xl overflow-hidden border transition-all duration-300 ${
      justLeveledUp ? 'animate-level-up' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Visual Identity Area */}
      <div className="relative aspect-square overflow-hidden bg-slate-950">
        <img 
          src={hero.imageUrl} 
          alt={hero.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
        
        {/* Contextual Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
            {hero.class}
          </span>
        </div>

        <div className="absolute top-3 right-3">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-semibold text-indigo-300 tracking-wide">Level</span>
              <span className="text-2xl font-extrabold text-white drop-shadow-glow">{hero.stats.level}</span>
            </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white tracking-tight">{hero.name}</h3>
        </div>
      </div>

      {/* Structured Content Area */}
      <div className="p-5 flex flex-col flex-1 space-y-5">

        {/* Professional Stats Display */}
        <div className="grid grid-cols-2 gap-px bg-slate-800 rounded-lg overflow-hidden border border-slate-800">
          <div className="bg-slate-900/60 p-3 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Attack</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-200">{hero.stats.attack}</span>
              {justLeveledUp && <span className="text-[10px] text-emerald-400 font-bold">+2</span>}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Defense</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-200">{hero.stats.defense}</span>
              {justLeveledUp && <span className="text-[10px] text-emerald-400 font-bold">+2</span>}
            </div>
          </div>
        </div>

        {/* Primary Actions - Refined */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onTrain?.(hero.id)}
            disabled={isTraining}
            className="flex-[3] relative h-11 bg-white hover:bg-slate-100 disabled:bg-slate-800 text-slate-950 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            {isTraining ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                TRAIN UNIT
              </>
            )}
          </button>
          <button
            onClick={() => onTransfer?.(hero.id)}
            className="text-md font-bold flex-1 h-11 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-lg transition-all flex items-center justify-center"
            title="Transfer ownership"
          >
            SEND
          </button>
        </div>
      </div>
    </div>
  );
};