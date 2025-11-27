import React from 'react';
import { Knob, Fader } from './Controls';
import { DeckId, DeckState, MixerState } from '../types';
import { audioEngine } from '../services/audioEngine';

interface MixerProps {
  deckA: DeckState;
  deckB: DeckState;
  mixerState: MixerState;
  setDeckState: (id: DeckId, updates: Partial<DeckState>) => void;
  setMixerState: (updates: Partial<MixerState>) => void;
}

export const Mixer: React.FC<MixerProps> = ({ deckA, deckB, mixerState, setDeckState, setMixerState }) => {

  const handleEQChange = (id: DeckId, band: 'high'|'mid'|'low', val: number) => {
    // val is 0 to 1
    // Map 0 -> -1 (cut), 0.5 -> 0 (flat), 1 -> +1 (boost)
    const normalized = (val - 0.5) * 2; 
    audioEngine.setEQ(id, band, normalized);
    
    // Update React State
    const deck = id === DeckId.A ? deckA : deckB;
    setDeckState(id, { eq: { ...deck.eq, [band]: normalized } });
  };

  const handleVolumeChange = (id: DeckId, val: number) => {
      audioEngine.setVolume(id, val);
      setDeckState(id, { volume: val });
  };

  const handleCrossfader = (val: number) => {
      // val is 0 to 1. Map to -1 to 1
      const x = (val - 0.5) * 2;
      audioEngine.setCrossfader(x);
      setMixerState({ crossfader: x });
  };

  const Strip = ({ id, state }: { id: DeckId, state: DeckState }) => (
    <div className="flex flex-col items-center gap-4 py-4 bg-slate-800/40 rounded-lg w-24 border border-white/5">
      <div className="space-y-4">
        <Knob 
          label="HI" 
          value={(state.eq.high / 2) + 0.5} 
          onChange={(v) => handleEQChange(id, 'high', v)} 
          size={48} 
          color="#94a3b8" 
        />
        <Knob 
          label="MID" 
          value={(state.eq.mid / 2) + 0.5} 
          onChange={(v) => handleEQChange(id, 'mid', v)} 
          size={48} 
          color="#94a3b8"
        />
        <Knob 
          label="LOW" 
          value={(state.eq.low / 2) + 0.5} 
          onChange={(v) => handleEQChange(id, 'low', v)} 
          size={48} 
          color="#94a3b8"
        />
        <Knob 
          label="FILTER" 
          value={(state.fx.filter / 2) + 0.5} 
          onChange={(v) => { /* Implement filter */ }} 
          size={56} 
          color={id === DeckId.A ? '#06b6d4' : '#f472b6'}
        />
      </div>
      
      <div className="flex-1 flex items-end pt-4">
         <Fader 
            vertical 
            value={state.volume} 
            onChange={(v) => handleVolumeChange(id, v)} 
            className="h-48"
         />
      </div>
      <div className="font-bold text-slate-500">{id}</div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 bg-slate-900/80 p-4 rounded-xl border-x-4 border-slate-800 shadow-2xl z-10 min-w-[280px]">
      <div className="flex gap-4 h-full">
        <Strip id={DeckId.A} state={deckA} />
        
        {/* Central Metering & Master */}
        <div className="flex flex-col items-center justify-between py-4 w-16">
            <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-500">MASTER</span>
                <Knob 
                    value={mixerState.masterVolume} 
                    onChange={(v) => setMixerState({ masterVolume: v })} 
                    size={48} 
                    color="#ffffff" 
                />
            </div>
            
            {/* Mock VU Meters */}
            <div className="flex gap-1 h-32 items-end">
                <div className="w-2 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 h-full rounded opacity-80" />
                <div className="w-2 bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 h-[80%] rounded opacity-80" />
            </div>
        </div>

        <Strip id={DeckId.B} state={deckB} />
      </div>

      {/* Crossfader */}
      <div className="w-full px-8 pt-4 pb-2 bg-slate-800/50 rounded-lg">
        <Fader 
            vertical={false} 
            value={(mixerState.crossfader / 2) + 0.5} 
            onChange={handleCrossfader} 
            className="w-full"
            label="CROSSFADER"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1 px-1">
            <span>A</span>
            <span>B</span>
        </div>
      </div>
    </div>
  );
};
