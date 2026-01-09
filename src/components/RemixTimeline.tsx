import { Clock, Layers, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RemixResult, RemixSection, RemixChange } from "@/types/remix";

interface RemixTimelineProps {
  result: RemixResult | null;
  isRemixing: boolean;
  progress?: number;
}

export function RemixTimeline({ result, isRemixing, progress = 0 }: RemixTimelineProps) {
  if (isRemixing) {
    return (
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Generating Remix</span>
        </div>

        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Processing</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stage indicators */}
          <div className="space-y-2">
            <StageIndicator 
              label="Analyzing structure" 
              complete={progress > 20} 
              active={progress <= 20}
            />
            <StageIndicator 
              label="Detecting stems" 
              complete={progress > 40} 
              active={progress > 20 && progress <= 40}
            />
            <StageIndicator 
              label="Applying transformations" 
              complete={progress > 60} 
              active={progress > 40 && progress <= 60}
            />
            <StageIndicator 
              label="Building arrangement" 
              complete={progress > 80} 
              active={progress > 60 && progress <= 80}
            />
            <StageIndicator 
              label="Finalizing mix" 
              complete={progress >= 100} 
              active={progress > 80 && progress < 100}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Remix Timeline</span>
        </div>
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          Generate a remix to see the timeline
        </div>
      </div>
    );
  }

  const getSectionColor = (source: RemixSection['source']) => {
    switch (source) {
      case 'track1': return 'bg-neon-cyan';
      case 'track2': return 'bg-neon-purple';
      case 'generated': return 'bg-gradient-to-r from-neon-orange to-neon-pink';
      default: return 'bg-muted';
    }
  };

  const getSectionBgColor = (source: RemixSection['source']) => {
    switch (source) {
      case 'track1': return 'bg-neon-cyan/20';
      case 'track2': return 'bg-neon-purple/20';
      case 'generated': return 'bg-neon-orange/20';
      default: return 'bg-muted/20';
    }
  };

  return (
    <div className="glass-panel p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Remix Timeline</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono">
            {Math.floor(result.duration / 60)}:{String(Math.floor(result.duration % 60)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Visual timeline */}
      <div className="relative h-12 rounded-lg overflow-hidden bg-muted/20 mb-4">
        {result.timeline.map((section, i) => {
          const startPercent = (section.startTime / result.duration) * 100;
          const widthPercent = ((section.endTime - section.startTime) / result.duration) * 100;
          return (
            <div
              key={i}
              className={cn("absolute top-0 bottom-0 flex items-center justify-center group", getSectionBgColor(section.source))}
              style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
            >
              <div className={cn("absolute top-0 h-1 w-full", getSectionColor(section.source))} />
              <span className="text-[9px] uppercase tracking-wider text-foreground/70 font-medium">
                {section.type}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-neon-cyan" />
          Track 1
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-neon-purple" />
          Track 2
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-neon-orange" />
          Generated
        </div>
      </div>

      {/* Changes log */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Changes Applied
        </div>
        {result.changes.slice(0, 5).map((change, i) => (
          <div 
            key={i}
            className="flex items-start gap-2 text-xs bg-muted/20 rounded p-2"
          >
            <ChangeIcon type={change.type} />
            <div className="flex-1">
              <span className="text-foreground">{change.description}</span>
              <span className="text-muted-foreground ml-2 font-mono">
                @{Math.floor(change.timestamp / 60)}:{String(Math.floor(change.timestamp % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
        {result.changes.length > 5 && (
          <div className="text-xs text-muted-foreground text-center">
            +{result.changes.length - 5} more changes
          </div>
        )}
      </div>
    </div>
  );
}

function StageIndicator({ label, complete, active }: { label: string; complete: boolean; active: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs transition-colors",
      complete ? "text-success" : active ? "text-primary" : "text-muted-foreground"
    )}>
      <div className={cn(
        "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
        complete ? "bg-success" : active ? "bg-primary animate-pulse" : "bg-muted"
      )}>
        {complete && <span className="text-[10px]">✓</span>}
        {active && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
      </div>
      {label}
    </div>
  );
}

function ChangeIcon({ type }: { type: RemixChange['type'] }) {
  const iconClass = "w-3 h-3 mt-0.5";
  switch (type) {
    case 'cut':
      return <div className={cn(iconClass, "text-neon-red")}>✂</div>;
    case 'extend':
      return <ArrowRight className={cn(iconClass, "text-neon-green")} />;
    case 'add':
      return <div className={cn(iconClass, "text-neon-cyan")}>+</div>;
    case 'remove':
      return <div className={cn(iconClass, "text-neon-orange")}>−</div>;
    case 'transform':
      return <Sparkles className={cn(iconClass, "text-secondary")} />;
    default:
      return null;
  }
}
