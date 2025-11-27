
import React, { useState, useEffect } from 'react';
import { Deck } from './components/Deck';
import { Mixer } from './components/Mixer';
import { AIDJAssistant } from './components/AIDJAssistant';
import { Library } from './components/Library';
import { DeckId, DeckState, MixerState, Track, PerformanceSession, PlayedTrackSnapshot, Playlist, PermissionRole } from './types';
import { DEMO_TRACKS, INITIAL_DECK_STATE } from './constants';
import { audioEngine } from './services/audioEngine';
import { Disc, Radio, Mic } from 'lucide-react';

const App: React.FC = () => {
  // --- State Management ---
  const [deckA, setDeckA] = useState<DeckState>({ ...INITIAL_DECK_STATE });
  const [deckB, setDeckB] = useState<DeckState>({ ...INITIAL_DECK_STATE });
  const [mixer, setMixer] = useState<MixerState>({ crossfader: 0, masterVolume: 1 });
  
  // -- New Feature States --
  const [isRecording, setIsRecording] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState<number | null>(null);
  const [currentSessionTracks, setCurrentSessionTracks] = useState<PlayedTrackSnapshot[]>([]);
  const [sessions, setSessions] = useState<PerformanceSession[]>([]);
  
  const [playlists, setPlaylists] = useState<Playlist[]>([
      {
          id: 'p1',
          name: 'Main Stage Hype',
          description: 'Tracks for the peak hour',
          collaborators: [{ name: 'You', role: 'Owner' }],
          permissions: { public: true, allowCollaboration: true },
          tracks: [
              { ...DEMO_TRACKS[3], addedBy: 'You', addedAt: Date.now() - 100000 }
          ]
      }
  ]);

  // Load initial demo tracks
  useEffect(() => {
    setDeckA(prev => ({ ...prev, track: DEMO_TRACKS[0] }));
    setDeckB(prev => ({ ...prev, track: DEMO_TRACKS[3] }));
  }, []);

  const handleDeckLoad = (id: DeckId, trackUrl?: string) => {
    const url = trackUrl || (id === DeckId.A ? deckA.track?.url : deckB.track?.url);
    if (url) {
      audioEngine.loadTrack(id, url);
    }
  };

  const updateDeck = (id: DeckId, updates: Partial<DeckState>) => {
    if (id === DeckId.A) setDeckA(prev => ({ ...prev, ...updates }));
    else setDeckB(prev => ({ ...prev, ...updates }));
  };

  const updateMixer = (updates: Partial<MixerState>) => {
    setMixer(prev => ({ ...prev, ...updates }));
  };

  // --- Feature Logic: Recording History ---

  const toggleRecording = () => {
      if (isRecording) {
          // Stop Recording
          if (currentSessionStart) {
              const newSession: PerformanceSession = {
                  id: `sess_${Date.now()}`,
                  startTime: currentSessionStart,
                  endTime: Date.now(),
                  duration: (Date.now() - currentSessionStart) / 1000,
                  tracks: currentSessionTracks,
                  notes: '',
                  tags: []
              };
              setSessions(prev => [newSession, ...prev]);
          }
          setIsRecording(false);
          setCurrentSessionStart(null);
          setCurrentSessionTracks([]);
      } else {
          // Start Recording
          setIsRecording(true);
          setCurrentSessionStart(Date.now());
          setCurrentSessionTracks([]);
      }
  };

  const handleDeckPlay = (id: DeckId) => {
      // Only log if we are recording
      if (!isRecording || !currentSessionStart) return;

      const state = id === DeckId.A ? deckA : deckB;
      if (!state.track) return;

      // Avoid duplicate logs if play is pressed multiple times quickly?
      // For now, we log every "Play" intent as it might signify a drop or restart.
      const snapshot: PlayedTrackSnapshot = {
          track: state.track,
          deckId: id,
          timestamp: Date.now(),
          relativeTime: (Date.now() - currentSessionStart) / 1000,
          snapshot: {
              eq: { ...state.eq },
              fx: { ...state.fx },
              stems: { ...state.stems }
          }
      };

      setCurrentSessionTracks(prev => [...prev, snapshot]);
  };

  const updateSessionNotes = (sessionId: string, notes: string) => {
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, notes } : s));
  };

  // --- Feature Logic: Playlists ---

  const createPlaylist = (name: string) => {
      const newPlaylist: Playlist = {
          id: `p_${Date.now()}`,
          name,
          description: '',
          collaborators: [{ name: 'You', role: 'Owner' }],
          permissions: { public: false, allowCollaboration: true },
          tracks: []
      };
      setPlaylists(prev => [...prev, newPlaylist]);
  };

  const addToPlaylist = (playlistId: string, track: Track) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id !== playlistId) return p;
          return {
              ...p,
              tracks: [...p.tracks, { ...track, addedBy: 'You', addedAt: Date.now() }]
          };
      }));
  };

  const inviteCollaborator = (playlistId: string, name: string, role: PermissionRole) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id !== playlistId) return p;
          // Check if already exists? Nah, simple append for demo
          return { ...p, collaborators: [...p.collaborators, { name, role }] };
      }));
  };

  const removeCollaborator = (playlistId: string, name: string) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id !== playlistId) return p;
          return { ...p, collaborators: p.collaborators.filter(c => c.name !== name) };
      }));
  };

  const togglePlaylistPublic = (playlistId: string) => {
      setPlaylists(prev => prev.map(p => {
          if (p.id !== playlistId) return p;
          return { 
              ...p, 
              permissions: { 
                  ...p.permissions, 
                  public: !p.permissions.public 
              } 
          };
      }));
  };

  const simulateCollabAdd = (playlistId: string) => {
      // Simulate "DJ Snake" adding a random track
      const randomTrack = DEMO_TRACKS[Math.floor(Math.random() * DEMO_TRACKS.length)];
      setPlaylists(prev => prev.map(p => {
          if (p.id !== playlistId) return p;
          return {
              ...p,
              tracks: [...p.tracks, { ...randomTrack, addedBy: 'DJ Snake', addedAt: Date.now() }]
          };
      }));
  };

  // --- Render ---

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white font-sans">
      {/* Top Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-6 justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Disc className="text-white w-5 h-5 animate-spin-slow" />
            </div>
            <h1 className="font-bold text-xl tracking-tighter hidden md:block">VIRTUOSO <span className="text-cyan-400 font-light">AI</span></h1>
         </div>

         {/* Center: Recording Status */}
         <div className="flex items-center gap-4">
            <button 
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${
                    isRecording 
                    ? 'bg-red-900/30 border-red-500 text-red-400 animate-pulse' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
            >
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-slate-500'}`} />
                <span className="text-xs font-bold tracking-wider">{isRecording ? formatDuration((Date.now() - (currentSessionStart || 0))/1000) : 'REC SESSION'}</span>
            </button>
         </div>

         <div className="text-sm text-slate-400 font-mono hidden md:block">
            {new Date().toLocaleTimeString()}
         </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Deck A Section */}
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 relative border-r border-slate-800/50">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
             <Deck 
                id={DeckId.A} 
                color="#06b6d4" 
                state={deckA} 
                onStateChange={updateDeck}
                onPlay={() => handleDeckPlay(DeckId.A)}
             />
             {!deckA.track && (
                 <div className="mt-4 text-slate-500 text-sm animate-pulse">Load track from Library</div>
             )}
              {deckA.track && !audioEngine.getCurrentTime(DeckId.A) && deckA.track.url && (
                 <button onClick={() => handleDeckLoad(DeckId.A, deckA.track?.url)} className="mt-4 text-xs bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded border border-cyan-500/30 hover:bg-cyan-900/50">
                     INITIALIZE AUDIO ENGINE A
                 </button>
             )}
        </div>

        {/* Mixer Section */}
        <div className="z-10 flex items-center justify-center px-2 py-4 md:py-0 bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <Mixer 
                deckA={deckA} 
                deckB={deckB} 
                mixerState={mixer}
                setDeckState={updateDeck}
                setMixerState={updateMixer}
            />
        </div>

        {/* Deck B Section */}
        <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center bg-gradient-to-bl from-slate-900 to-slate-950 relative border-l border-slate-800/50">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
             <Deck 
                id={DeckId.B} 
                color="#f472b6" 
                state={deckB} 
                onStateChange={updateDeck}
                onPlay={() => handleDeckPlay(DeckId.B)}
             />
             {deckB.track && !audioEngine.getCurrentTime(DeckId.B) && deckB.track.url && (
                 <button onClick={() => handleDeckLoad(DeckId.B, deckB.track?.url)} className="mt-4 text-xs bg-pink-900/30 text-pink-400 px-3 py-1 rounded border border-pink-500/30 hover:bg-pink-900/50">
                     INITIALIZE AUDIO ENGINE B
                 </button>
             )}
        </div>

      </main>

      {/* Advanced Library Drawer */}
      <Library 
         tracks={DEMO_TRACKS}
         playlists={playlists}
         sessions={sessions}
         onLoadTrack={(id, track) => {
             updateDeck(id, { track, isPlaying: false });
             if (track.url) handleDeckLoad(id, track.url);
         }}
         onAddToPlaylist={addToPlaylist}
         onCreatePlaylist={createPlaylist}
         onInviteCollaborator={inviteCollaborator}
         onRemoveCollaborator={removeCollaborator}
         onTogglePublic={togglePlaylistPublic}
         onUpdateSessionNotes={updateSessionNotes}
         onSimulateCollabAdd={simulateCollabAdd}
      />

      <AIDJAssistant />
    </div>
  );
};

// Helper for live recording timer
function formatDuration(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default App;
