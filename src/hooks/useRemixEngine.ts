import { useState, useCallback } from "react";
import type { 
  TrackAnalysis, 
  StemAnalysis, 
  SongMatch, 
  RemixSettings, 
  RemixResult,
  AppMode 
} from "@/types/remix";

// Mock data generators for demo purposes
const generateWaveformData = (): number[] => {
  return Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
};

const generateEnergyCurve = (): number[] => {
  const curve: number[] = [];
  for (let i = 0; i < 20; i++) {
    // Create a curve that builds up, drops, and builds again
    const phase = i / 20;
    if (phase < 0.15) curve.push(0.3 + phase * 2);
    else if (phase < 0.35) curve.push(0.6 + (phase - 0.15) * 2);
    else if (phase < 0.45) curve.push(1 - (phase - 0.35) * 3);
    else if (phase < 0.55) curve.push(0.7);
    else if (phase < 0.75) curve.push(0.7 + (phase - 0.55) * 1.5);
    else curve.push(1 - (phase - 0.75) * 2);
  }
  return curve;
};

const KEYS = ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CAMELOT_MAP: Record<string, string> = {
  'Am': '8A', 'Bm': '10A', 'Cm': '5A', 'Dm': '7A', 'Em': '9A', 'Fm': '4A', 'Gm': '6A',
  'C': '8B', 'D': '10B', 'E': '12B', 'F': '7B', 'G': '9B', 'A': '11B', 'B': '1B'
};

const generateAnalysis = (fileName: string): TrackAnalysis => {
  const bpm = Math.floor(Math.random() * 30) + 125; // 125-155 BPM
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const duration = Math.floor(Math.random() * 180) + 180; // 3-6 minutes
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    fileName,
    bpm,
    bpmDrift: Math.random() * 1.5,
    key,
    camelotKey: CAMELOT_MAP[key] || '8A',
    mode: key.includes('m') ? 'minor' : 'major',
    energy: Math.random() * 0.4 + 0.6,
    energyCurve: generateEnergyCurve(),
    structure: [
      { type: 'intro', startTime: 0, endTime: duration * 0.1, energy: 0.4 },
      { type: 'buildup', startTime: duration * 0.1, endTime: duration * 0.2, energy: 0.7 },
      { type: 'drop', startTime: duration * 0.2, endTime: duration * 0.4, energy: 1 },
      { type: 'break', startTime: duration * 0.4, endTime: duration * 0.55, energy: 0.5 },
      { type: 'buildup', startTime: duration * 0.55, endTime: duration * 0.65, energy: 0.8 },
      { type: 'drop', startTime: duration * 0.65, endTime: duration * 0.85, energy: 1 },
      { type: 'outro', startTime: duration * 0.85, endTime: duration, energy: 0.3 },
    ],
    duration,
    waveformData: generateWaveformData(),
  };
};

const generateStems = (): StemAnalysis => ({
  vocals: Math.random() * 0.6 + 0.1,
  drums: Math.random() * 0.3 + 0.7,
  bass: Math.random() * 0.3 + 0.6,
  synths: Math.random() * 0.5 + 0.3,
  other: Math.random() * 0.3,
});

const ARTISTS = ['Amelie Lens', 'Charlotte de Witte', 'Adam Beyer', 'Enrico Sangiuliano', 'Kobosil', 'ANNA', 'Blawan', 'Paula Temple'];
const GENRES = ['Techno', 'Hard Techno', 'Industrial Techno', 'Melodic Techno'];
const SUB_GENRES = ['Peak Time', 'Dark', 'Hypnotic', 'Driving', 'Acid', 'Raw'];

const generateMatches = (analysis: TrackAnalysis | null): SongMatch[] => {
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 matches
  return Array.from({ length: count }, (_, i) => {
    const key = KEYS[Math.floor(Math.random() * KEYS.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: `${['Dark', 'Night', 'Pulse', 'Machine', 'System', 'Control', 'Movement'][Math.floor(Math.random() * 7)]} ${['Runner', 'Driver', 'Code', 'Shift', 'State', 'Zone'][Math.floor(Math.random() * 6)]}`,
      artist: ARTISTS[Math.floor(Math.random() * ARTISTS.length)],
      bpm: analysis ? analysis.bpm + Math.floor(Math.random() * 6) - 3 : 130 + Math.floor(Math.random() * 20),
      key,
      camelotKey: CAMELOT_MAP[key] || '8A',
      genre: GENRES[Math.floor(Math.random() * GENRES.length)],
      subGenre: SUB_GENRES[Math.floor(Math.random() * SUB_GENRES.length)],
      energyLevel: Math.floor(Math.random() * 40) + 60,
      compatibilityScore: Math.floor(Math.random() * 25) + 75 - i * 5,
      matchReason: [
        `Harmonic compatibility (${key}), similar BPM range, complementary energy curve with strong drops`,
        `Perfect key match for mixing, driving percussion pattern matches your track's groove`,
        `Compatible Camelot wheel position, similar breakdown structure, energy levels align`,
        `Bass frequencies complement your track, matching tempo allows seamless transitions`,
      ][i % 4],
    };
  }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

const generateRemixResult = (duration: number, hasTwoTracks: boolean): RemixResult => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    audioUrl: '/remix-output.wav',
    timeline: [
      { type: 'intro', startTime: 0, endTime: 16, source: 'generated', description: 'Techno intro with rolling kick' },
      { type: 'buildup', startTime: 16, endTime: 32, source: 'track1', description: 'Tension buildup with filtered elements' },
      { type: 'drop', startTime: 32, endTime: 64, source: hasTwoTracks ? 'track1' : 'track1', description: 'Main drop with full energy' },
      { type: 'breakdown', startTime: 64, endTime: 80, source: 'generated', description: 'Atmospheric break' },
      { type: 'buildup', startTime: 80, endTime: 96, source: hasTwoTracks ? 'track2' : 'generated', description: 'Second tension build' },
      { type: 'drop', startTime: 96, endTime: 144, source: hasTwoTracks ? 'track2' : 'track1', description: 'Extended drop section' },
      { type: 'outro', startTime: 144, endTime: duration, source: 'generated', description: 'DJ-friendly outro' },
    ],
    changes: [
      { type: 'add', description: 'Added techno-style kick pattern', timestamp: 0 },
      { type: 'transform', description: 'Pitch-shifted to match target key', timestamp: 8 },
      { type: 'cut', description: 'Removed weak verse section', timestamp: 24 },
      { type: 'add', description: 'Inserted tension riser before drop', timestamp: 28 },
      { type: 'extend', description: 'Extended drop section by 16 bars', timestamp: 32 },
      { type: 'transform', description: 'Applied sidechain compression to bass', timestamp: 48 },
      { type: 'remove', description: 'Cleaned cluttered mid frequencies', timestamp: 56 },
      { type: 'add', description: 'Added atmospheric breakdown elements', timestamp: 64 },
      { type: 'extend', description: 'Extended final drop for club play', timestamp: 96 },
    ],
    duration,
  };
};

export function useRemixEngine() {
  const [mode, setMode] = useState<AppMode>('upload');
  const [track1, setTrack1] = useState<File | null>(null);
  const [track2, setTrack2] = useState<File | null>(null);
  const [analysis1, setAnalysis1] = useState<TrackAnalysis | null>(null);
  const [analysis2, setAnalysis2] = useState<TrackAnalysis | null>(null);
  const [stems1, setStems1] = useState<StemAnalysis | undefined>();
  const [stems2, setStems2] = useState<StemAnalysis | undefined>();
  const [matches, setMatches] = useState<SongMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [remixResult, setRemixResult] = useState<RemixResult | null>(null);
  const [remixProgress, setRemixProgress] = useState(0);
  const [settings, setSettings] = useState<RemixSettings>({
    targetBpm: 138,
    energyIntensity: 0.8,
    darkness: 0.6,
    dropLength: 32,
    vocalPresence: 'minimal',
    style: 'peak-time',
  });

  const analyzeTrack = useCallback(async (file: File, trackNumber: 1 | 2) => {
    setMode('analyzing');
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = generateAnalysis(file.name);
    const stems = generateStems();
    
    if (trackNumber === 1) {
      setAnalysis1(analysis);
      setStems1(stems);
      setSettings(prev => ({ ...prev, targetBpm: analysis.bpm }));
    } else {
      setAnalysis2(analysis);
      setStems2(stems);
    }
    
    setMode('analyzed');
  }, []);

  const handleTrack1Change = useCallback(async (file: File | null) => {
    setTrack1(file);
    if (file) {
      await analyzeTrack(file, 1);
    } else {
      setAnalysis1(null);
      setStems1(undefined);
      setMode('upload');
    }
  }, [analyzeTrack]);

  const handleTrack2Change = useCallback(async (file: File | null) => {
    setTrack2(file);
    if (file) {
      await analyzeTrack(file, 2);
    } else {
      setAnalysis2(null);
      setStems2(undefined);
    }
  }, [analyzeTrack]);

  const findMatches = useCallback(async () => {
    setIsSearching(true);
    setMode('matching');
    
    // Simulate search time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newMatches = generateMatches(analysis1);
    setMatches(newMatches);
    setIsSearching(false);
    setMode('analyzed');
  }, [analysis1]);

  const startRemix = useCallback(async () => {
    setMode('remixing');
    setRemixProgress(0);
    setRemixResult(null);
    
    // Simulate remix generation with progress
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setRemixProgress((i / steps) * 100);
    }
    
    const duration = analysis1 ? analysis1.duration * 0.8 : 180;
    const result = generateRemixResult(duration, !!track2);
    setRemixResult(result);
    setMode('complete');
  }, [analysis1, track2]);

  const matcherMode = !track1 && !track2 ? 'discovery' : track1 ? 'single' : 'none';
  const canRemix = !!analysis1;

  return {
    mode,
    track1,
    track2,
    analysis1,
    analysis2,
    stems1,
    stems2,
    matches,
    isSearching,
    remixResult,
    remixProgress,
    settings,
    matcherMode: matcherMode as 'single' | 'discovery' | 'none',
    canRemix,
    isAnalyzing: mode === 'analyzing',
    isRemixing: mode === 'remixing',
    setSettings,
    handleTrack1Change,
    handleTrack2Change,
    findMatches,
    startRemix,
  };
}
