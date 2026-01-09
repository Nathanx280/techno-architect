import { Header } from "@/components/Header";
import { AudioUploader } from "@/components/AudioUploader";
import { WaveformDisplay } from "@/components/WaveformDisplay";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { RemixControls } from "@/components/RemixControls";
import { SongMatcher } from "@/components/SongMatcher";
import { RemixTimeline } from "@/components/RemixTimeline";
import { ExportPanel } from "@/components/ExportPanel";
import { useRemixEngine } from "@/hooks/useRemixEngine";

const Index = () => {
  const {
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
    matcherMode,
    canRemix,
    isAnalyzing,
    isRemixing,
    setSettings,
    handleTrack1Change,
    handleTrack2Change,
    findMatches,
    startRemix,
  } = useRemixEngine();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">AI Techno</span> Remix Engine
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your tracks. Let AI analyze, harmonize, and transform them into 
            club-ready techno remixes with professional-grade precision.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Upload & Waveforms */}
          <div className="lg:col-span-5 space-y-4">
            {/* Track Uploaders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AudioUploader 
                trackNumber={1}
                file={track1}
                onFileSelect={handleTrack1Change}
                isAnalyzing={isAnalyzing && !analysis1}
              />
              <AudioUploader 
                trackNumber={2}
                file={track2}
                onFileSelect={handleTrack2Change}
                isAnalyzing={isAnalyzing && !!track2 && !analysis2}
              />
            </div>

            {/* Waveform Displays */}
            <WaveformDisplay 
              analysis={analysis1} 
              trackNumber={1}
              isActive={!!analysis1}
            />
            {track2 && (
              <WaveformDisplay 
                analysis={analysis2} 
                trackNumber={2}
                isActive={!!analysis2}
              />
            )}

            {/* Song Matcher */}
            <SongMatcher
              mode={matcherMode}
              analysis={analysis1}
              matches={matches}
              isSearching={isSearching}
              onFindMatches={findMatches}
            />
          </div>

          {/* Middle Column - Analysis */}
          <div className="lg:col-span-3 space-y-4">
            <AnalysisPanel 
              analysis={analysis1} 
              stems={stems1}
              trackNumber={1} 
            />
            {track2 && (
              <AnalysisPanel 
                analysis={analysis2} 
                stems={stems2}
                trackNumber={2} 
              />
            )}
          </div>

          {/* Right Column - Controls & Output */}
          <div className="lg:col-span-4 space-y-4">
            <RemixControls
              settings={settings}
              onSettingsChange={setSettings}
              onStartRemix={startRemix}
              isRemixing={isRemixing}
              canRemix={canRemix}
            />

            <RemixTimeline
              result={remixResult}
              isRemixing={isRemixing}
              progress={remixProgress}
            />

            <ExportPanel result={remixResult} />
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            This is a demo interface. Connect Lovable Cloud for full AI-powered audio processing.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
