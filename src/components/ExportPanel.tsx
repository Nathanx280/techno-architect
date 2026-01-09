import { Download, FileAudio, Music2, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RemixResult } from "@/types/remix";

interface ExportPanelProps {
  result: RemixResult | null;
}

export function ExportPanel({ result }: ExportPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

  if (!result) {
    return (
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Export</span>
        </div>
        <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
          Complete a remix to export
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-4 h-4 text-success" />
        <span className="text-sm font-medium">Export Ready</span>
      </div>

      {/* Player controls */}
      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isPlaying 
                ? "bg-primary neon-glow" 
                : "bg-muted hover:bg-primary/20"
            )}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-foreground ml-1" />
            )}
          </button>

          <div className="flex-1">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-primary to-secondary" />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground font-mono">
              <span>1:24</span>
              <span>{Math.floor(result.duration / 60)}:{String(Math.floor(result.duration % 60)).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume * 100}
              onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
              className="w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
            />
          </div>
        </div>
      </div>

      {/* Export buttons */}
      <div className="space-y-2">
        <Button variant="gradient" className="w-full" size="lg">
          <FileAudio className="w-4 h-4" />
          Download WAV (DJ Quality)
        </Button>
        <Button variant="outline" className="w-full">
          <Music2 className="w-4 h-4" />
          Download MP3 (320kbps)
        </Button>
      </div>

      {/* Format info */}
      <div className="mt-4 p-3 bg-muted/20 rounded-lg">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Format</span>
            <span className="font-mono text-foreground">WAV 48kHz / 24bit</span>
          </div>
          <div className="flex justify-between">
            <span>Duration</span>
            <span className="font-mono text-foreground">
              {Math.floor(result.duration / 60)}:{String(Math.floor(result.duration % 60)).padStart(2, '0')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Structure</span>
            <span className="font-mono text-foreground">DJ-ready (intro/outro)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
