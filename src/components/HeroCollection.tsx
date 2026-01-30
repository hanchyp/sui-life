import React from 'react';
import { Hero } from '@/types';
import { HeroCard } from './HeroCard';

interface HeroCollectionProps {
  heroes: Hero[];
  onTrain: (id: string) => void;
  onTransfer: (id: string) => void;
  trainingId: string | null;
  leveledUpId: string | null;
  onMintClick: () => void;
}

export const HeroCollection: React.FC<HeroCollectionProps> = ({
  heroes,
  onTrain,
  onTransfer,
  trainingId,
  isTraining,
  leveledUpId,
  onMintClick
}) => {
  return (
    <div className="space-y-8 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-900">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Active Units</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and train your unique asset collection.</p>
        </div>
        <button 
          onClick={onMintClick}
          className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
        >
          Summon Unit
        </button>
      </header>

      {heroes.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
          <span className="text-slate-600 mb-4 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line></svg>
          </span>
          <p className="text-slate-500 text-sm font-medium">No units found in your primary wallet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {heroes.map(hero => (
            <HeroCard 
              key={hero.id} 
              hero={hero} 
              onTrain={onTrain}
              onTransfer={onTransfer}
              isTraining={isTraining && trainingId === hero.id}
              justLeveledUp={leveledUpId === hero.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};