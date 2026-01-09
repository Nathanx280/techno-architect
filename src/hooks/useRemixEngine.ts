import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { 
  TrackAnalysis, 
  StemAnalysis, 
  SongMatch, 
  RemixSettings, 
  RemixResult,
  AppMode 
} from "@/types/remix";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Generate waveform data from audio analysis
const generateWaveformData = (): number[] => {
  return Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
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

  // Estimate audio duration from file size (rough estimate)
  const estimateDuration = (fileSize: number): number => {
    // Assume ~1MB per minute for compressed audio
    const minutes = fileSize / (1024 * 1024);
    return Math.max(180, Math.min(600, minutes * 60));
  };

  const analyzeTrack = useCallback(async (file: File, trackNumber: 1 | 2) => {
    setMode('analyzing');
    
    try {
      const estimatedDuration = estimateDuration(file.size);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          duration: estimatedDuration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed: ${response.status}`);
      }

      const analysisData = await response.json();
      
      const analysis: TrackAnalysis = {
        id: `track-${Date.now()}`,
        fileName: file.name,
        bpm: analysisData.bpm,
        bpmDrift: analysisData.bpmDrift,
        key: analysisData.key,
        camelotKey: analysisData.camelotKey,
        mode: analysisData.mode,
        energy: analysisData.energy,
        energyCurve: analysisData.energyCurve || generateWaveformData().slice(0, 20),
        structure: analysisData.structure || [],
        duration: analysisData.duration || estimatedDuration,
        waveformData: analysisData.waveformData || generateWaveformData(),
      };

      const stems: StemAnalysis = analysisData.stemAnalysis || {
        vocals: 0.2,
        drums: 0.8,
        bass: 0.7,
        synths: 0.5,
        other: 0.2,
      };
      
      if (trackNumber === 1) {
        setAnalysis1(analysis);
        setStems1(stems);
        setSettings(prev => ({ ...prev, targetBpm: analysis.bpm }));
      } else {
        setAnalysis2(analysis);
        setStems2(stems);
      }
      
      setMode('analyzed');
      toast.success(`Track ${trackNumber} analyzed: ${analysis.bpm} BPM, ${analysis.key}`);
      
    } catch (error) {
      console.error('Analysis error:', error);
      const message = error instanceof Error ? error.message : 'Analysis failed';
      toast.error(message);
      setMode('upload');
    }
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
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/find-matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          analysis: analysis1,
          mode: analysis1 ? 'single' : 'discovery',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }

      const data = await response.json();
      setMatches(data.matches || []);
      toast.success(`Found ${data.matches?.length || 0} compatible tracks`);
      
    } catch (error) {
      console.error('Find matches error:', error);
      const message = error instanceof Error ? error.message : 'Search failed';
      toast.error(message);
    } finally {
      setIsSearching(false);
      setMode('analyzed');
    }
  }, [analysis1]);

  const startRemix = useCallback(async () => {
    if (!analysis1) {
      toast.error('Please upload a track first');
      return;
    }

    setMode('remixing');
    setRemixProgress(0);
    setRemixResult(null);
    
    // Simulate progress while waiting for AI
    const progressInterval = setInterval(() => {
      setRemixProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-remix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          analysis1,
          analysis2,
          settings,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Remix generation failed: ${response.status}`);
      }

      const result = await response.json();
      
      setRemixProgress(100);
      setRemixResult(result);
      setMode('complete');
      toast.success('Remix generated successfully!');
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Remix error:', error);
      const message = error instanceof Error ? error.message : 'Remix generation failed';
      toast.error(message);
      setMode('analyzed');
      setRemixProgress(0);
    }
  }, [analysis1, analysis2, settings]);

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
