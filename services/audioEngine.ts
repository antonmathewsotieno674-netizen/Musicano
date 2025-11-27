// A simplified Audio Engine using Web Audio API
import { DeckId } from '../types';

class AudioEngine {
  private context: AudioContext | null = null;
  private deckNodes: Record<DeckId, {
    source: MediaElementAudioSourceNode | null;
    element: HTMLAudioElement;
    gain: GainNode;
    eqHigh: BiquadFilterNode;
    eqMid: BiquadFilterNode;
    eqLow: BiquadFilterNode;
    // Simulating stems with filters
    stemVocals: GainNode;
    stemDrums: GainNode; 
    stemBass: GainNode; 
    stemOther: GainNode;
  } | null> = { [DeckId.A]: null, [DeckId.B]: null };
  
  private masterGain: GainNode | null = null;
  private crossfaderGainA: GainNode | null = null;
  private crossfaderGainB: GainNode | null = null;

  // Initialize context on user interaction
  init() {
    if (this.context) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContextClass();
    
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    // Setup Crossfader Architecture
    this.crossfaderGainA = this.context.createGain();
    this.crossfaderGainB = this.context.createGain();
    
    this.crossfaderGainA.connect(this.masterGain);
    this.crossfaderGainB.connect(this.masterGain);
    
    this.setupDeck(DeckId.A);
    this.setupDeck(DeckId.B);
  }

  private setupDeck(id: DeckId) {
    if (!this.context || !this.crossfaderGainA || !this.crossfaderGainB) return;

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.loop = true; // DJ decks usually loop if end is reached or manual loop

    const source = this.context.createMediaElementSource(audio);
    
    // EQ Chain
    const high = this.context.createBiquadFilter();
    high.type = 'highshelf';
    high.frequency.value = 2500;

    const mid = this.context.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 0.5;

    const low = this.context.createBiquadFilter();
    low.type = 'lowshelf';
    low.frequency.value = 320;

    // Stem Simulation (Just Volume Nodes for now, could be filter bands)
    // To properly simulate stems without AI separation, we just use these as sub-gains
    // Ideally, these would load 4 separate audio files, but for a single file demo, 
    // we will map them to specific EQ bands for "Effect"
    const stemBass = this.context.createBiquadFilter();
    stemBass.type = 'lowshelf'; 
    stemBass.frequency.value = 200; // Acts as bass kill/boost

    const stemVocals = this.context.createBiquadFilter();
    stemVocals.type = 'peaking';
    stemVocals.frequency.value = 3000; // Presence range

    // Main Deck Gain
    const gain = this.context.createGain();

    // Connect Chain: Source -> Stems(Filters) -> EQ -> Gain -> Crossfader
    source.connect(stemBass).connect(stemVocals).connect(low).connect(mid).connect(high).connect(gain);
    
    if (id === DeckId.A) {
      gain.connect(this.crossfaderGainA);
    } else {
      gain.connect(this.crossfaderGainB);
    }

    this.deckNodes[id] = {
      source,
      element: audio,
      gain,
      eqHigh: high,
      eqMid: mid,
      eqLow: low,
      stemVocals: null as any, // Using filters for simulation
      stemDrums: null as any,
      stemBass: null as any, 
      stemOther: null as any
    };
    
    // Storing references to the specific filters used for stems for manipulation
    (this.deckNodes[id] as any)._stemBassFilter = stemBass;
    (this.deckNodes[id] as any)._stemVocalsFilter = stemVocals;
  }

  loadTrack(id: DeckId, url: string) {
    this.init();
    const deck = this.deckNodes[id];
    if (deck) {
      deck.element.src = url;
      deck.element.load();
    }
  }

  play(id: DeckId) {
    this.init();
    this.context?.resume();
    const deck = this.deckNodes[id];
    if (deck) {
      deck.element.play().catch(e => console.error(e));
    }
  }

  pause(id: DeckId) {
    const deck = this.deckNodes[id];
    if (deck) {
      deck.element.pause();
    }
  }

  setVolume(id: DeckId, value: number) {
    const deck = this.deckNodes[id];
    if (deck) {
      deck.gain.gain.setTargetAtTime(value, this.context!.currentTime, 0.05);
    }
  }

  setSpeed(id: DeckId, value: number) {
     const deck = this.deckNodes[id];
    if (deck) {
        // value is -0.08 to +0.08 usually for pitch fader (8%)
        // here we assume value is raw playbackRate multiplier (0.92 to 1.08)
        deck.element.playbackRate = value;
    }
  }

  setCrossfader(value: number) {
    // value between -1 (A) and 1 (B)
    if (!this.context || !this.crossfaderGainA || !this.crossfaderGainB) return;
    
    // Constant power crossfade
    const x = (value + 1) * 0.5; // 0 to 1
    const gainA = Math.cos(x * 0.5 * Math.PI);
    const gainB = Math.cos((1 - x) * 0.5 * Math.PI);

    this.crossfaderGainA.gain.setTargetAtTime(gainA, this.context.currentTime, 0.05);
    this.crossfaderGainB.gain.setTargetAtTime(gainB, this.context.currentTime, 0.05);
  }

  setEQ(id: DeckId, band: 'high'|'mid'|'low', value: number) {
    // value is -10 to +10 dB roughly
    const deck = this.deckNodes[id];
    if (!deck) return;
    
    const db = value * 20; // Scale 0-1 control to dB roughly? Assuming input is -1 to 1?
    // Let's assume input is centered at 0.
    
    if (band === 'high') deck.eqHigh.gain.setTargetAtTime(db, this.context!.currentTime, 0.1);
    if (band === 'mid') deck.eqMid.gain.setTargetAtTime(db, this.context!.currentTime, 0.1);
    if (band === 'low') deck.eqLow.gain.setTargetAtTime(db, this.context!.currentTime, 0.1);
  }
  
  setStem(id: DeckId, stem: 'bass'|'vocals', value: number) {
      // Value 0 to 1
      const deck = this.deckNodes[id] as any;
      if (!deck) return;
      
      // Simulate stem muting/isolation via extreme EQ cuts
      if (stem === 'bass') {
          // If value is 1, gain is 0dB. If value is 0, gain is -40dB
          const gain = (value - 1) * 40; 
          deck._stemBassFilter.gain.setTargetAtTime(gain, this.context!.currentTime, 0.1);
      }
      if (stem === 'vocals') {
          const gain = (value - 1) * 40;
          deck._stemVocalsFilter.gain.setTargetAtTime(gain, this.context!.currentTime, 0.1);
      }
  }

  getCurrentTime(id: DeckId) {
      return this.deckNodes[id]?.element.currentTime || 0;
  }
  
  getDuration(id: DeckId) {
      return this.deckNodes[id]?.element.duration || 0;
  }
}

export const audioEngine = new AudioEngine();
