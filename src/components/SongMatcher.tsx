import { Search, Sparkles, ArrowRight, Music2, Gauge, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SongMatch, TrackAnalysis } from "@/types/remix";

interface SongMatcherProps {
  mode: 'single' | 'discovery' | 'none';
  analysis: TrackAnalysis | null;
  matches: SongMatch[];
  isSearching: boolean;
  onFindMatches: () => void;
}

export function SongMatcher({ mode, analysis, matches, isSearching, onFindMatches }: SongMatcherProps) {
  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-neon-green';
    if (score >= 75) return 'text-neon-cyan';
    if (score >= 60) return 'text-neon-orange';
    return 'text-muted-foreground';
  };

  const getEnergyLevel = (level: number) => {
    if (level >= 80) return { label: 'High', color: 'bg-neon-red' };
    if (level >= 50) return { label: 'Medium', color: 'bg-neon-orange' };
    return { label: 'Low', color: 'bg-neon-green' };
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Song Matching</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-secondary" />
          AI Discovery
        </div>
      </div>

      {/* Mode indicator */}
      <div className="bg-muted/30 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          {mode === 'single' && "Finding matches for your uploaded track"}
          {mode === 'discovery' && "Discovering perfect track pairs"}
          {mode === 'none' && "Upload a track to find harmonic matches"}
        </div>
        {analysis && (
          <div className="flex items-center gap-2 mt-2">
            <span className="key-badge">{analysis.camelotKey}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-primary">Compatible keys</span>
          </div>
        )}
      </div>

      {/* Search button */}
      <Button
        variant="neon"
        className="w-full mb-4"
        onClick={onFindMatches}
        disabled={isSearching || (mode === 'single' && !analysis)}
      >
        {isSearching ? (
          <>
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            {mode === 'discovery' ? 'Discover Track Pairs' : 'Find Matching Songs'}
          </>
        )}
      </Button>

      {/* Results */}
      {matches.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {matches.length} Matches Found
          </div>
          
          {matches.map((match) => {
            const energy = getEnergyLevel(match.energyLevel);
            return (
              <div 
                key={match.id}
                className="bg-muted/20 rounded-lg p-3 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{match.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{match.artist}</p>
                  </div>
                  <div className={cn(
                    "text-lg font-bold font-mono",
                    getCompatibilityColor(match.compatibilityScore)
                  )}>
                    {match.compatibilityScore}%
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="bpm-badge">
                    <Gauge className="w-3 h-3" />
                    {match.bpm}
                  </span>
                  <span className="key-badge">
                    <Music2 className="w-3 h-3" />
                    {match.camelotKey}
                  </span>
                  <span className="energy-badge">
                    <Zap className="w-3 h-3" />
                    {energy.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {match.genre}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {match.subGenre}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                  <span className="text-primary">Match reason:</span> {match.matchReason}
                </p>

                <Button variant="ghost" size="sm" className="w-full text-xs">
                  <ExternalLink className="w-3 h-3" />
                  Find on streaming platforms
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {!isSearching && matches.length === 0 && mode !== 'none' && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Click search to discover compatible tracks
        </div>
      )}
    </div>
  );
}
