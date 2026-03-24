import React, { useState } from 'react';
import { MapPin, Calendar, Wallet, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface TravelFormProps {
  onSubmit: (data: { destination: string; duration: string; budget: 'low' | 'mid' | 'high'; style: string }) => void;
  isLoading: boolean;
  initialDestination?: string;
}

export function TravelForm({ onSubmit, isLoading, initialDestination = '' }: TravelFormProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [duration, setDuration] = useState('3 days');
  const [budget, setBudget] = useState<'low' | 'mid' | 'high'>('mid');
  const [style, setStyle] = useState('Aesthetic & Chill');
  const [isCustomStyle, setIsCustomStyle] = useState(false);
  const [customStyle, setCustomStyle] = useState('');

  const TRAVEL_STYLES = [
    'Aesthetic & Chill',
    'Luxury & Comfort',
    'Budget Friendly',
    'Adventure & Outdoors',
    'Cultural Immersion',
    'Foodie Tour',
    'Family Friendly',
    'Solo Traveler',
    'Romantic Getaway',
    'Backpacking'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ 
      destination, 
      duration, 
      budget, 
      style: isCustomStyle ? customStyle : style 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-ink/5 space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-olive flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          Where to?
        </label>
        <input 
          type="text" 
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Kyoto, Japan (or leave blank for ideas)"
          className="w-full px-4 py-3 rounded-2xl border border-ink/10 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-olive flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            Duration
          </label>
          <div className="relative">
            <select 
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-ink/10 bg-white focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition-all appearance-none pr-10"
            >
              <option>Weekend trip</option>
              <option>3 days</option>
              <option>5 days</option>
              <option>1 week</option>
              <option>2 weeks</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-olive flex items-center gap-2">
            <Wallet className="w-3 h-3" />
            Budget
          </label>
          <div className="flex p-1 bg-ink/5 rounded-2xl">
            {(['low', 'mid', 'high'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold uppercase tracking-tighter rounded-xl transition-all",
                  budget === b ? "bg-white text-olive shadow-sm" : "text-ink/40 hover:text-ink/60"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-olive flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Travel Style
          </label>
          <div className="relative">
            <select 
              value={isCustomStyle ? 'other' : style}
              onChange={(e) => {
                if (e.target.value === 'other') {
                  setIsCustomStyle(true);
                } else {
                  setIsCustomStyle(false);
                  setStyle(e.target.value);
                }
              }}
              className="w-full px-4 py-3 rounded-2xl border border-ink/10 bg-white focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition-all appearance-none pr-10"
            >
              {TRAVEL_STYLES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="other">Other (Custom Style)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30 pointer-events-none" />
          </div>
        </div>

        {isCustomStyle && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <input 
              type="text" 
              value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="Describe your style (e.g. Solo Photography, Art Deco Tour)"
              className="w-full px-4 py-3 rounded-2xl border border-ink/10 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition-all"
              autoFocus
            />
          </div>
        )}
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="w-full py-4 bg-olive text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-olive-light transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Planning your trip...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate My Journey
          </>
        )}
      </button>
    </form>
  );
}
