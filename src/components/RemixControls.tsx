import { Sliders, Gauge, Moon, Timer, Mic2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RemixSettings } from "@/types/remix";

interface RemixControlsProps {
  settings: RemixSettings;
  onSettingsChange: (settings: RemixSettings) => void;
  onStartRemix: () => void;
  isRemixing: boolean;
  canRemix: boolean;
}

const STYLES = [
  { id: 'peak-time', label: 'Peak Time', description: 'High-energy club bangers' },
  { id: 'hard-techno', label: 'Hard Techno', description: 'Aggressive, driving beats' },
  { id: 'industrial', label: 'Industrial', description: 'Dark, metallic sounds' },
  { id: 'melodic', label: 'Melodic', description: 'Emotional, atmospheric' },
] as const;

const VOCAL_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'featured', label: 'Featured' },
] as const;

export function RemixControls({ 
  settings, 
  onSettingsChange, 
  onStartRemix, 
  isRemixing,
  canRemix 
}: RemixControlsProps) {
  const updateSetting = <K extends keyof RemixSettings>(key: K, value: RemixSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center gap-2 mb-5">
        <Sliders className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Remix Controls</span>
      </div>

      {/* Style Selection */}
      <div className="mb-5">
        <label className="text-xs text-muted-foreground uppercase tracking-wider mb-3 block">
          Techno Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => updateSetting('style', style.id)}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 text-left",
                settings.style === style.id
                  ? "border-primary bg-primary/10 neon-glow"
                  : "border-border/50 bg-muted/30 hover:border-primary/50"
              )}
            >
              <span className="text-sm font-medium block">{style.label}</span>
              <span className="text-[10px] text-muted-foreground">{style.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BPM Control */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-neon-purple" />
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Target BPM
            </label>
          </div>
          <span className="text-sm font-mono font-bold">{settings.targetBpm}</span>
        </div>
        <input
          type="range"
          min={120}
          max={160}
          value={settings.targetBpm}
          onChange={(e) => updateSetting('targetBpm', parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--primary)/0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>120</span>
          <span>160</span>
        </div>
      </div>

      {/* Energy Intensity */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon-orange" />
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Energy Intensity
            </label>
          </div>
          <span className="text-sm font-mono font-bold">{Math.round(settings.energyIntensity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.energyIntensity * 100}
          onChange={(e) => updateSetting('energyIntensity', parseInt(e.target.value) / 100)}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-orange
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--neon-orange)/0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Darkness */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-neon-purple" />
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Darkness / Aggression
            </label>
          </div>
          <span className="text-sm font-mono font-bold">{Math.round(settings.darkness * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.darkness * 100}
          onChange={(e) => updateSetting('darkness', parseInt(e.target.value) / 100)}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--secondary)/0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Drop Length */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-neon-green" />
            <label className="text-xs text-muted-foreground uppercase tracking-wider">
              Drop Length
            </label>
          </div>
          <span className="text-sm font-mono font-bold">{settings.dropLength}s</span>
        </div>
        <input
          type="range"
          min={16}
          max={64}
          step={8}
          value={settings.dropLength}
          onChange={(e) => updateSetting('dropLength', parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-green
            [&::-webkit-slider-thumb]:shadow-[0_0_10px_hsl(var(--neon-green)/0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      {/* Vocal Presence */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Mic2 className="w-4 h-4 text-neon-pink" />
          <label className="text-xs text-muted-foreground uppercase tracking-wider">
            Vocal Presence
          </label>
        </div>
        <div className="flex gap-2">
          {VOCAL_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => updateSetting('vocalPresence', option.id)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all",
                settings.vocalPresence === option.id
                  ? "bg-neon-pink/20 text-neon-pink border border-neon-pink/50"
                  : "bg-muted/30 text-muted-foreground border border-transparent hover:border-neon-pink/30"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remix Button */}
      <Button 
        variant="gradient" 
        size="xl" 
        className="w-full"
        onClick={onStartRemix}
        disabled={!canRemix || isRemixing}
      >
        {isRemixing ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating Remix...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Techno Remix
          </>
        )}
      </Button>

      {!canRemix && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Upload at least one track to start
        </p>
      )}
    </div>
  );
}
