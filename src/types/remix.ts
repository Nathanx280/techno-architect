export interface TrackAnalysis {
  id: string;
  fileName: string;
  bpm: number;
  bpmDrift: number;
  key: string;
  camelotKey: string;
  mode: 'major' | 'minor';
  energy: number;
  energyCurve: number[];
  structure: SongSection[];
  duration: number;
  waveformData: number[];
}

export interface SongSection {
  type: 'intro' | 'verse' | 'buildup' | 'drop' | 'break' | 'outro';
  startTime: number;
  endTime: number;
  energy: number;
}

export interface StemAnalysis {
  vocals: number;
  drums: number;
  bass: number;
  synths: number;
  other: number;
}

export interface SongMatch {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  camelotKey: string;
  genre: string;
  subGenre: string;
  energyLevel: number;
  compatibilityScore: number;
  matchReason: string;
}

export interface RemixSettings {
  targetBpm: number;
  energyIntensity: number;
  darkness: number;
  dropLength: number;
  vocalPresence: 'none' | 'minimal' | 'featured';
  style: 'peak-time' | 'hard-techno' | 'industrial' | 'melodic';
}

export interface RemixResult {
  id: string;
  audioUrl: string;
  timeline: RemixSection[];
  changes: RemixChange[];
  duration: number;
}

export interface RemixSection {
  type: string;
  startTime: number;
  endTime: number;
  source: 'track1' | 'track2' | 'generated';
  description: string;
}

export interface RemixChange {
  type: 'cut' | 'extend' | 'add' | 'remove' | 'transform';
  description: string;
  timestamp: number;
}

export type AppMode = 'upload' | 'analyzing' | 'analyzed' | 'matching' | 'remixing' | 'complete';
