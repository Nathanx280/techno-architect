import { Disc3, Zap } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Disc3 className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight neon-text">REMIX ENGINE</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AI Techno Studio</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">ENGINE READY</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="w-3.5 h-3.5 text-warning" />
            <span className="font-mono">v2.0</span>
          </div>
        </div>
      </div>
    </header>
  );
}
