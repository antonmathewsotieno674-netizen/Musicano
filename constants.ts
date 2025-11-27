import { Track } from './types';

export const DEMO_TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Neon Nights',
    artist: 'Cyber Runner',
    bpm: 128,
    key: 'Am',
    duration: 210,
    coverArt: 'https://picsum.photos/200/200?random=1',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3' // Placeholder open source audio
  },
  {
    id: 't2',
    title: 'Deep Focus',
    artist: 'Mindset',
    bpm: 124,
    key: 'Cm',
    duration: 195,
    coverArt: 'https://picsum.photos/200/200?random=2',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=music-for-video-115688.mp3'
  },
  {
    id: 't3',
    title: 'Retro Wave',
    artist: 'Synth Master',
    bpm: 110,
    key: 'Gm',
    duration: 240,
    coverArt: 'https://picsum.photos/200/200?random=3',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=ambient-piano-10025.mp3'
  },
  {
    id: 't4',
    title: 'Acid Bass',
    artist: 'Techno Viking',
    bpm: 135,
    key: 'F#',
    duration: 300,
    coverArt: 'https://picsum.photos/200/200?random=4',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff131b.mp3?filename=electronic-future-beats-117997.mp3'
  }
];

export const INITIAL_DECK_STATE = {
  track: null,
  isPlaying: false,
  volume: 1,
  pitch: 0,
  cuePoints: [],
  eq: { high: 0, mid: 0, low: 0 },
  stems: { vocals: 1, drums: 1, bass: 1, other: 1 },
  fx: { filter: 0, echo: 0 }
};
