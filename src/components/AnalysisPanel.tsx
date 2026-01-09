import { Activity, Gauge, Music, Waves, Mic2, Drum, Piano, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackAnalysis, StemAnalysis } from "@/types/remix";

interface AnalysisPanelProps {
  analysis: TrackAnalysis | null;
  stems?: StemAnalysis;
  trackNumber: 1 | 2;
}

export function AnalysisPanel({ analysis, stems, trackNumber }: AnalysisPanelProps) {
  if (!analysis) {
    return (
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Track {trackNumber} Analysis
          </span>
        </div>
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Upload a track to analyze
        </div>
      </div>
    );
  }

  const energyColor = analysis.energy > 0.7 ? 'text-neon-red' : 
                      analysis.energy > 0.4 ? 'text-neon-orange' : 'text-neon-green';

  return (
    <div className="glass-panel p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Track {trackNumber} Analysis
          </span>
        </div>
        <span className="text-[10px] font-mono text-success">COMPLETE</span>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-neon-purple" />
            <span className="text-xs text-muted-foreground">Tempo</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono">{analysis.bpm}</span>
            <span className="text-xs text-muted-foreground">BPM</span>
          </div>
          {analysis.bpmDrift > 0.5 && (
            <span className="text-[10px] text-warning mt-1 block">
              ±{analysis.bpmDrift.toFixed(1)} drift detected
            </span>
          )}
        </div>

        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs text-muted-foreground">Key</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{analysis.key}</span>
            <span className="text-xs text-muted-foreground">{analysis.mode}</span>
          </div>
          <span className="text-[10px] text-primary mt-1 block font-mono">
            {analysis.camelotKey}
          </span>
        </div>
      </div>

      {/* Energy curve */}
      <div className="bg-muted/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-neon-orange" />
            <span className="text-xs text-muted-foreground">Energy Curve</span>
          </div>
          <span className={cn("text-sm font-bold font-mono", energyColor)}>
            {Math.round(analysis.energy * 100)}%
          </span>
        </div>
        <div className="h-8 flex items-end gap-[2px]">
          {analysis.energyCurve.map((level, i) => (
            <div
              key={i}
              className="flex-1 rounded-t energy-bar"
              style={{ height: `${level * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Stem analysis */}
      {stems && (
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Stem Detection</span>
          </div>
          <div className="space-y-2">
            <StemBar icon={Mic2} label="Vocals" value={stems.vocals} color="neon-pink" />
            <StemBar icon={Drum} label="Drums" value={stems.drums} color="neon-orange" />
            <StemBar icon={Waves} label="Bass" value={stems.bass} color="neon-purple" />
            <StemBar icon={Piano} label="Synths" value={stems.synths} color="neon-cyan" />
          </div>
        </div>
      )}
    </div>
  );
}

interface StemBarProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}

function StemBar({ icon: Icon, label, value, color }: StemBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("w-3.5 h-3.5", `text-${color}`)} />
      <span className="text-[10px] text-muted-foreground w-12">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full", `bg-${color}`)}
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}
