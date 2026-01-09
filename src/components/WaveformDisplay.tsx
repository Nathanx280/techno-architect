import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { TrackAnalysis, SongSection } from "@/types/remix";

interface WaveformDisplayProps {
  analysis: TrackAnalysis | null;
  trackNumber: 1 | 2;
  isActive?: boolean;
}

export function WaveformDisplay({ analysis, trackNumber, isActive }: WaveformDisplayProps) {
  const waveformBars = useMemo(() => {
    if (!analysis) {
      // Generate placeholder waveform
      return Array.from({ length: 100 }, () => Math.random() * 0.3 + 0.1);
    }
    return analysis.waveformData;
  }, [analysis]);

  const getSectionColor = (type: SongSection['type']) => {
    switch (type) {
      case 'intro': return 'bg-neon-cyan/40';
      case 'verse': return 'bg-neon-purple/40';
      case 'buildup': return 'bg-neon-orange/40';
      case 'drop': return 'bg-neon-pink/40';
      case 'break': return 'bg-neon-green/40';
      case 'outro': return 'bg-muted-foreground/40';
      default: return 'bg-muted/40';
    }
  };

  return (
    <div className={cn(
      "glass-panel p-4 overflow-hidden",
      isActive && "gradient-border"
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Track {trackNumber} Waveform
        </span>
        {analysis && (
          <div className="flex items-center gap-2">
            <span className="bpm-badge">{analysis.bpm} BPM</span>
            <span className="key-badge">{analysis.camelotKey} · {analysis.key}</span>
          </div>
        )}
      </div>

      {/* Section indicators */}
      {analysis && (
        <div className="relative h-4 mb-2 rounded overflow-hidden bg-muted/20">
          {analysis.structure.map((section, i) => {
            const startPercent = (section.startTime / analysis.duration) * 100;
            const widthPercent = ((section.endTime - section.startTime) / analysis.duration) * 100;
            return (
              <div
                key={i}
                className={cn("absolute top-0 bottom-0", getSectionColor(section.type))}
                style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[8px] uppercase tracking-wider text-foreground/70 font-medium">
                  {section.type}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Waveform visualization */}
      <div className="waveform-container h-24 rounded-lg p-2 flex items-center gap-[2px]">
        {waveformBars.map((height, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-sm transition-all duration-150",
              analysis ? "bg-gradient-to-t from-primary to-primary/60" : "bg-muted-foreground/30"
            )}
            style={{ 
              height: `${height * 100}%`,
              opacity: analysis ? 1 : 0.5,
              animationDelay: analysis ? undefined : `${i * 10}ms`
            }}
          />
        ))}
      </div>

      {/* Beat grid markers */}
      {analysis && (
        <div className="relative h-2 mt-2">
          {Array.from({ length: Math.floor(analysis.duration / 4) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute top-0 bottom-0 w-px",
                i % 4 === 0 ? "bg-secondary" : "bg-primary/30"
              )}
              style={{ left: `${(i / (analysis.duration / 4)) * 100}%` }}
            />
          ))}
        </div>
      )}

      {/* Time markers */}
      {analysis && (
        <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground">
          <span>0:00</span>
          <span>{Math.floor(analysis.duration / 60)}:{String(Math.floor(analysis.duration % 60)).padStart(2, '0')}</span>
        </div>
      )}
    </div>
  );
}
