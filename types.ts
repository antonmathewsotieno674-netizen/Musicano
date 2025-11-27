
export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: number; // in seconds
  url?: string; // For demo purposes
  coverArt?: string;
}

export enum DeckId {
  A = 'A',
  B = 'B'
}

export interface DeckState {
  track: Track | null;
  isPlaying: boolean;
  volume: number;
  pitch: number;
  cuePoints: number[];
  eq: {
    high: number;
    mid: number;
    low: number;
  };
  stems: {
    vocals: number;
    drums: number;
    bass: number;
    other: number;
  };
  fx: {
    filter: number; // Low pass <-> High pass
    echo: number;
  };
}

export interface MixerState {
  crossfader: number; // -1 (A) to 1 (B)
  masterVolume: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- History & Playlist Types ---

export interface PlayedTrackSnapshot {
  track: Track;
  timestamp: number; // Unix timestamp
  relativeTime: number; // Seconds since session start
  deckId: DeckId;
  snapshot: {
    eq: DeckState['eq'];
    fx: DeckState['fx'];
    stems: DeckState['stems'];
  };
}

export interface PerformanceSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tracks: PlayedTrackSnapshot[];
  notes: string;
  tags: string[];
}

export interface PlaylistTrack extends Track {
  addedBy: string; // User name
  addedAt: number; // Timestamp
}

export type PermissionRole = 'Owner' | 'Editor' | 'Viewer';

export interface Collaborator {
  name: string;
  role: PermissionRole;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: PlaylistTrack[];
  collaborators: Collaborator[]; // List of collaborators with roles
  permissions: {
    public: boolean;
    allowCollaboration: boolean;
  };
}
