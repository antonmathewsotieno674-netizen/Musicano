
import React, { useState } from 'react';
import { Track, DeckId, Playlist, PerformanceSession, PlayedTrackSnapshot, PermissionRole } from '../types';
import { Music, Clock, Users, Plus, List, PlayCircle, History, UserPlus, Tag, Crown, Globe, Lock, X } from 'lucide-react';

interface LibraryProps {
  tracks: Track[];
  playlists: Playlist[];
  sessions: PerformanceSession[];
  onLoadTrack: (id: DeckId, track: Track) => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onCreatePlaylist: (name: string) => void;
  onInviteCollaborator: (playlistId: string, name: string, role: PermissionRole) => void;
  onRemoveCollaborator: (playlistId: string, name: string) => void;
  onTogglePublic: (playlistId: string) => void;
  onUpdateSessionNotes: (sessionId: string, notes: string) => void;
  onSimulateCollabAdd: (playlistId: string) => void;
}

export const Library: React.FC<LibraryProps> = ({
  tracks,
  playlists,
  sessions,
  onLoadTrack,
  onAddToPlaylist,
  onCreatePlaylist,
  onInviteCollaborator,
  onRemoveCollaborator,
  onTogglePublic,
  onUpdateSessionNotes,
  onSimulateCollabAdd
}) => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'history'>('tracks');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [draggedTrack, setDraggedTrack] = useState<Track | null>(null);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Render Functions ---

  const renderTracks = () => (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-slate-950 text-slate-500 sticky top-0">
          <tr>
            <th className="p-3 font-medium w-12"></th>
            <th className="p-3 font-medium">TITLE</th>
            <th className="p-3 font-medium">ARTIST</th>
            <th className="p-3 font-medium">BPM</th>
            <th className="p-3 font-medium">KEY</th>
            <th className="p-3 font-medium text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {tracks.map(track => (
            <tr 
              key={track.id} 
              className="hover:bg-slate-800/50 group transition-colors cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={() => setDraggedTrack(track)}
              onDragEnd={() => setDraggedTrack(null)}
            >
              <td className="p-3 text-center"><Music className="w-4 h-4" /></td>
              <td className="p-3 text-white font-medium">{track.title}</td>
              <td className="p-3">{track.artist}</td>
              <td className="p-3 text-cyan-500">{track.bpm}</td>
              <td className="p-3 text-pink-500">{track.key}</td>
              <td className="p-3 text-right">
                <div className="flex justify-end gap-2">
                   {playlists.length > 0 && (
                       <button 
                         onClick={() => onAddToPlaylist(playlists[0].id, track)}
                         title={`Add to ${playlists[0].name}`}
                         className="p-1 hover:text-white hover:bg-slate-700 rounded"
                       >
                           <List className="w-4 h-4" />
                       </button>
                   )}
                   <button 
                      onClick={() => onLoadTrack(DeckId.A, track)}
                      className="text-[10px] bg-slate-800 hover:bg-cyan-900 hover:text-cyan-400 px-2 py-1 rounded border border-slate-700"
                   >
                       LOAD A
                   </button>
                   <button 
                      onClick={() => onLoadTrack(DeckId.B, track)}
                      className="text-[10px] bg-slate-800 hover:bg-pink-900 hover:text-pink-400 px-2 py-1 rounded border border-slate-700"
                   >
                       LOAD B
                   </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPlaylists = () => {
    const activePlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];
    const isOwner = activePlaylist?.collaborators.some(c => c.name === 'You' && c.role === 'Owner');
    
    const handleInvite = () => {
        const name = prompt("Enter collaborator username:");
        if (!name) return;
        
        const roleInput = prompt("Enter role (owner, editor, viewer):", "editor");
        if (!roleInput) return;
        
        let role: PermissionRole = 'Viewer';
        const lower = roleInput.toLowerCase();
        if (lower.includes('own')) role = 'Owner';
        else if (lower.includes('edit')) role = 'Editor';
        
        onInviteCollaborator(activePlaylist.id, name, role);
    };

    return (
      <div className="flex h-full">
        {/* Playlist Sidebar */}
        <div className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-800">
                <button 
                    onClick={() => {
                        const name = prompt("Playlist Name:");
                        if (name) onCreatePlaylist(name);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-bold"
                >
                    <Plus className="w-4 h-4" /> NEW PLAYLIST
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {playlists.map(p => (
                    <div 
                        key={p.id}
                        onClick={() => setSelectedPlaylistId(p.id)}
                        className={`p-3 cursor-pointer flex items-center justify-between ${selectedPlaylistId === p.id || (!selectedPlaylistId && p === playlists[0]) ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:text-white hover:bg-slate-800/50'}`}
                    >
                        <span className="truncate font-medium">{p.name}</span>
                        <span className="text-xs bg-slate-900 px-2 py-0.5 rounded-full text-slate-500">{p.tracks.length}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Playlist Content */}
        {activePlaylist ? (
            <div className="flex-1 flex flex-col bg-slate-900/30">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {activePlaylist.name}
                            </h2>
                            <button 
                                onClick={() => isOwner && onTogglePublic(activePlaylist.id)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border ${activePlaylist.permissions.public ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-slate-600 text-slate-400'} ${isOwner ? 'cursor-pointer hover:bg-slate-700' : 'cursor-default'}`}
                                title={isOwner ? "Toggle Public/Private" : "Visibility"}
                            >
                                {activePlaylist.permissions.public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                {activePlaylist.permissions.public ? 'PUBLIC' : 'PRIVATE'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Users className="w-3 h-3" />
                            <div className="flex gap-2 flex-wrap">
                                {activePlaylist.collaborators.map((c, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-full group">
                                        {c.role === 'Owner' && <Crown className="w-3 h-3 text-yellow-500" />}
                                        <span className={c.role === 'Owner' ? 'text-yellow-100' : 'text-slate-300'}>{c.name}</span>
                                        <span className="opacity-50 text-[10px]">({c.role})</span>
                                        {isOwner && c.name !== 'You' && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onRemoveCollaborator(activePlaylist.id, c.name); }}
                                                className="ml-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={() => onSimulateCollabAdd(activePlaylist.id)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded flex items-center gap-1"
                         >
                             <Plus className="w-3 h-3" /> SIMULATE ADD
                         </button>
                         <button 
                            onClick={handleInvite}
                            disabled={!isOwner && !activePlaylist.permissions.allowCollaboration}
                            className={`text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-3 py-1.5 rounded flex items-center gap-1 ${(!isOwner && !activePlaylist.permissions.allowCollaboration) ? 'opacity-50 cursor-not-allowed' : ''}`}
                         >
                             <UserPlus className="w-3 h-3" /> INVITE
                         </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950/50 text-slate-500 sticky top-0">
                             <tr>
                                 <th className="p-3 w-14"></th>
                                 <th className="p-3">TITLE</th>
                                 <th className="p-3">ARTIST</th>
                                 <th className="p-3">DURATION</th>
                                 <th className="p-3">ADDED BY</th>
                                 <th className="p-3 text-right">ACTIONS</th>
                             </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                             {activePlaylist.tracks.map((pt, idx) => (
                                 <tr key={`${pt.id}-${idx}`} className="hover:bg-slate-800/50">
                                     <td className="p-2">
                                         {pt.coverArt ? (
                                             <img src={pt.coverArt} alt={pt.title} className="w-10 h-10 rounded object-cover shadow-sm bg-slate-800" />
                                         ) : (
                                             <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center">
                                                 <Music className="w-5 h-5 opacity-50" />
                                             </div>
                                         )}
                                     </td>
                                     <td className="p-3 text-white font-medium">{pt.title}</td>
                                     <td className="p-3">{pt.artist}</td>
                                     <td className="p-3 font-mono">{formatDuration(pt.duration)}</td>
                                     <td className="p-3">
                                         <div className="flex flex-col">
                                             <div className="flex items-center gap-2">
                                                 <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${pt.addedBy === 'You' ? 'bg-cyan-900 text-cyan-400' : 'bg-purple-900 text-purple-400'}`}>
                                                     {pt.addedBy.charAt(0)}
                                                 </div>
                                                 <span className={`text-xs font-bold ${pt.addedBy === 'You' ? 'text-cyan-400' : 'text-slate-300'}`}>
                                                     {pt.addedBy}
                                                 </span>
                                             </div>
                                             <span className="text-[10px] text-slate-500 pl-7">
                                                 {new Date(pt.addedAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })} • {new Date(pt.addedAt).toLocaleDateString()}
                                             </span>
                                         </div>
                                     </td>
                                     <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => onLoadTrack(DeckId.A, pt)}
                                                className="hover:text-cyan-400"
                                            >
                                                Load A
                                            </button>
                                            <button 
                                                onClick={() => onLoadTrack(DeckId.B, pt)}
                                                className="hover:text-pink-400"
                                            >
                                                Load B
                                            </button>
                                        </div>
                                     </td>
                                 </tr>
                             ))}
                             {activePlaylist.tracks.length === 0 && (
                                 <tr>
                                     <td colSpan={6} className="p-8 text-center text-slate-600 italic">
                                         Playlist is empty. Add tracks from Library or simulate collaboration.
                                     </td>
                                 </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">Select a playlist</div>
        )}
      </div>
    );
  }

  const renderHistory = () => (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {sessions.length === 0 ? (
              <div className="text-center text-slate-500 mt-12">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No performance history logged yet.</p>
                  <p className="text-sm">Hit the Record button in the header to start a session.</p>
              </div>
          ) : (
              sessions.map(session => (
                  <div key={session.id} className="bg-slate-900/80 border border-slate-800 rounded-lg overflow-hidden">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                        onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-cyan-500" />
                              </div>
                              <div>
                                  <div className="font-bold text-white">Session {new Date(session.startTime).toLocaleDateString()}</div>
                                  <div className="text-xs text-slate-400">
                                      {new Date(session.startTime).toLocaleTimeString()} • Duration: {Math.floor((session.duration || 0) / 60)}m {(session.duration || 0) % 60}s
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                               <div className="text-right">
                                   <div className="text-2xl font-mono font-bold text-white">{session.tracks.length}</div>
                                   <div className="text-[10px] text-slate-500 uppercase tracking-wider">Tracks</div>
                               </div>
                               <button className="text-slate-400 hover:text-white">
                                   {expandedSessionId === session.id ? 'Collapse' : 'Expand'}
                               </button>
                          </div>
                      </div>
                      
                      {expandedSessionId === session.id && (
                          <div className="border-t border-slate-800 bg-slate-950/30 p-4">
                               {/* Notes Section */}
                               <div className="mb-4">
                                   <label className="text-xs font-bold text-slate-500 mb-1 block">SESSION NOTES</label>
                                   <textarea 
                                       className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
                                       rows={2}
                                       value={session.notes}
                                       onChange={(e) => onUpdateSessionNotes(session.id, e.target.value)}
                                       placeholder="Add notes about this gig..."
                                   />
                               </div>

                               {/* Track List */}
                               <div className="space-y-2">
                                   {session.tracks.map((t, idx) => (
                                       <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800/50">
                                           <div className="flex items-center gap-3">
                                               <span className="text-xs font-mono text-slate-500 w-12 text-center">{Math.floor(t.relativeTime / 60)}:{Math.floor(t.relativeTime % 60).toString().padStart(2, '0')}</span>
                                               <div>
                                                   <div className="text-sm font-medium text-white">{t.track.title}</div>
                                                   <div className="text-xs text-slate-500">{t.track.artist}</div>
                                               </div>
                                           </div>

                                            {/* BPM & Key Snapshot */}
                                            <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                                                <div className="text-center">
                                                    <div className="text-xs font-mono text-cyan-500">{t.track.bpm}</div>
                                                    <div className="text-[9px] text-slate-600">BPM</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs font-mono text-pink-500">{t.track.key}</div>
                                                    <div className="text-[9px] text-slate-600">KEY</div>
                                                </div>
                                            </div>

                                            {/* EQ Snapshot Visualization */}
                                            <div className="flex items-center gap-1 h-8 px-2 border-l border-slate-800" title="EQ Snapshot: Low / Mid / High">
                                                {['low', 'mid', 'high'].map((band) => {
                                                    const val = t.snapshot.eq[band as keyof typeof t.snapshot.eq]; // -1 to 1 range typically
                                                    // Map value to height (2px min)
                                                    const height = Math.max(2, Math.abs(val) * 12 + 2); 
                                                    // Determine color
                                                    let color = 'bg-slate-600';
                                                    if (val > 0.1) color = 'bg-green-500';
                                                    if (val < -0.1) color = 'bg-red-500';

                                                    return (
                                                        <div key={band} className="flex flex-col justify-end h-full w-1.5 gap-px group relative">
                                                            <div 
                                                                className={`w-full rounded-sm ${color} opacity-80`} 
                                                                style={{ height: `${height}px` }}
                                                            />
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                                                {band.toUpperCase()}: {val.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                           
                                           {/* Status Chips */}
                                           <div className="flex items-center gap-2 border-l border-slate-800 pl-2">
                                               {t.snapshot.fx.filter !== 0 && (
                                                   <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600">
                                                       FILT {t.snapshot.fx.filter > 0 ? 'HI' : 'LO'}
                                                   </span>
                                               )}
                                               {t.snapshot.fx.echo > 0 && <span className="text-[9px] font-bold bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/50">ECHO</span>}
                                               <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${t.deckId === DeckId.A ? 'bg-cyan-900 text-cyan-400' : 'bg-pink-900 text-pink-400'}`}>
                                                   {t.deckId}
                                               </div>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                          </div>
                      )}
                  </div>
              ))
          )}
      </div>
  );

  return (
    <div className="h-64 bg-slate-900 border-t border-slate-800 flex flex-col z-20 shadow-[0_-5px_25px_rgba(0,0,0,0.5)]">
       {/* Tab Bar */}
       <div className="h-10 bg-slate-800 flex items-center px-4 gap-1 border-b border-slate-700 select-none">
           <button 
             onClick={() => setActiveTab('tracks')}
             className={`h-full px-4 text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'tracks' ? 'text-cyan-400 border-b-2 border-cyan-500 bg-slate-700/50' : 'text-slate-500 hover:text-white'}`}
           >
               <List className="w-3 h-3" /> LIBRARY
           </button>
           <button 
             onClick={() => setActiveTab('playlists')}
             className={`h-full px-4 text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'playlists' ? 'text-green-400 border-b-2 border-green-500 bg-slate-700/50' : 'text-slate-500 hover:text-white'}`}
           >
               <Users className="w-3 h-3" /> PLAYLISTS
           </button>
           <button 
             onClick={() => setActiveTab('history')}
             className={`h-full px-4 text-xs font-bold flex items-center gap-2 transition-colors ${activeTab === 'history' ? 'text-purple-400 border-b-2 border-purple-500 bg-slate-700/50' : 'text-slate-500 hover:text-white'}`}
           >
               <History className="w-3 h-3" /> HISTORY
           </button>
       </div>

       {/* Tab Content */}
       <div className="flex-1 flex overflow-hidden">
           {activeTab === 'tracks' && renderTracks()}
           {activeTab === 'playlists' && renderPlaylists()}
           {activeTab === 'history' && renderHistory()}
       </div>
    </div>
  );
};
