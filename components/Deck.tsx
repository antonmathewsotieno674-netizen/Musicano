
import React, { useState, useEffect } from 'react';
import { DeckId, DeckState, Track } from '../types';
import { Play, Pause, Disc, Upload, Music, Sparkles } from 'lucide-react';
import { Waveform } from './Waveform';
import { Knob, Fader } from './Controls';
import { audioEngine } from '../services/audioEngine';

interface DeckProps {
  id: DeckId;
  color: string;
  state: DeckState;
  onStateChange: (id: DeckId, updates: Partial<DeckState>) => void;
  onPlay?: () => void;
}

export const Deck: React.FC<DeckProps> = ({ id, color, state, onStateChange, onPlay }) => {
  const [progress, setProgress] = useState(0);

  // Poll for progress updates when playing
  useEffect(() => {
    let interval: number;
    if (state.isPlaying) {
      interval = window.setInterval(() => {
        const current = audioEngine.getCurrentTime(id);
        const total = audioEngine.getDuration(id) || state.track?.duration || 1;
        setProgress(current / total);
      }, 100); // 10fps update for UI
    }
    return () => clearInterval(interval);
  }, [state.isPlaying, id, state.track]);

  const togglePlay = () => {
    if (!state.track) return;
    if (state.isPlaying) {
      audioEngine.pause(id);
    } else {
      audioEngine.play(id);
      if (onPlay) onPlay();
    }
    onStateChange(id, { isPlaying: !state.isPlaying });
  };

  const handleStemChange = (stem: 'bass'|'vocals', val: number) => {
    audioEngine.setStem(id, stem, val);
    onStateChange(id, { 
        stems: { ...state.stems, [stem]: val } 
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentTime = (state.track?.duration || 0) * progress;

  return (
    <div className={`flex flex-col gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/20 backdrop-blur-sm shadow-xl flex-1 min-w-[320px]`}>
      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-black" style={{ backgroundColor: color }}>
            {id}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-white truncate max-w-[150px]">{state.track ? state.track.title : "No Track Loaded"}</h2>
            <p className="text-xs text-slate-400 truncate">{state.track ? state.track.artist : "Select a track"}</p>
          </div>
        </div>
        <div className="text-right font-mono text-cyan-400">
          <div className="text-lg">{state.track?.bpm || '--'} <span className="text-xs text-slate-500">BPM</span></div>
          <div className="text-xs text-slate-400">{state.track?.key || '--'}</div>
        </div>
      </div>

      {/* Waveform */}
      <div className="relative">
        <Waveform color={color} isPlaying={state.isPlaying} progress={progress} />
        <div className="absolute top-2 right-2 font-mono text-xs bg-black/50 px-1 rounded text-white">
            {formatTime(currentTime)} / {formatTime(state.track?.duration || 0)}
        </div>
      </div>

      {/* Main Controls Area */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Playback Controls */}
        <div className="col-span-3 flex flex-col items-center justify-center gap-3 bg-slate-900/50 rounded-lg p-2">
           <button 
             onClick={togglePlay}
             className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all shadow-lg shadow-${color}/20
               ${state.isPlaying ? `border-${color} text-${color}` : 'border-slate-600 text-slate-400 hover:border-white hover:text-white'}
             `}
             style={{ borderColor: state.isPlaying ? color : undefined, color: state.isPlaying ? color : undefined }}
           >
             {state.isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
           </button>
           <button className="px-4 py-1 text-xs font-bold border border-slate-600 rounded text-slate-400 hover:text-white hover:border-white">
             CUE
           </button>
        </div>

        {/* Pitch Fader */}
        <div className="col-span-2 flex justify-center">
            <Fader 
                vertical 
                value={0.5} 
                onChange={(v) => {
                    // v is 0-1. map to 0.92 - 1.08
                    const rate = 0.92 + (v * 0.16);
                    audioEngine.setSpeed(id, rate);
                }} 
                label="Tempo" 
            />
        </div>

        {/* Stems Section (AI Powered UI) */}
        <div className="col-span-7 bg-slate-900/50 rounded-lg p-3 border border-white/5">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    AI STEMS
                </span>
                <span className="text-[10px] text-slate-500">ISOLATION</span>
            </div>
            <div className="grid grid-cols-4 gap-2 h-full">
                {/* Vocals */}
                <div className="flex flex-col items-center gap-2">
                    <div 
                        className={`w-full h-24 rounded cursor-pointer relative overflow-hidden transition-all ${state.stems.vocals === 1 ? 'bg-slate-700' : 'bg-slate-800 opacity-50'}`}
                        onClick={() => handleStemChange('vocals', state.stems.vocals === 1 ? 0 : 1)}
                    >
                         <div className="absolute inset-x-0 bottom-0 bg-blue-500/20 h-full transition-all" style={{ height: `${state.stems.vocals * 100}%` }}/>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[10px] font-bold ${state.stems.vocals === 1 ? 'text-blue-300' : 'text-slate-500'}`}>VOX</span>
                         </div>
                    </div>
                </div>
                 {/* Bass */}
                 <div className="flex flex-col items-center gap-2">
                    <div 
                        className={`w-full h-24 rounded cursor-pointer relative overflow-hidden transition-all ${state.stems.bass === 1 ? 'bg-slate-700' : 'bg-slate-800 opacity-50'}`}
                        onClick={() => handleStemChange('bass', state.stems.bass === 1 ? 0 : 1)}
                    >
                         <div className="absolute inset-x-0 bottom-0 bg-red-500/20 h-full transition-all" style={{ height: `${state.stems.bass * 100}%` }}/>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-[10px] font-bold ${state.stems.bass === 1 ? 'text-red-300' : 'text-slate-500'}`}>BASS</span>
                         </div>
                    </div>
                </div>
                {/* Drums (Mock) */}
                <div className="flex flex-col items-center gap-2">
                    <div className="w-full h-24 rounded bg-slate-700 relative overflow-hidden cursor-not-allowed opacity-75">
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-yellow-300">DRM</span>
                         </div>
                    </div>
                </div>
                 {/* Other (Mock) */}
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-full h-24 rounded bg-slate-700 relative overflow-hidden cursor-not-allowed opacity-75">
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-green-300">INST</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
