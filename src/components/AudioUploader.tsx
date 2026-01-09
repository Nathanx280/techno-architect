import { useState, useCallback } from "react";
import { Upload, Music2, X, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioUploaderProps {
  trackNumber: 1 | 2;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  isAnalyzing?: boolean;
}

export function AudioUploader({ trackNumber, file, onFileSelect, isAnalyzing }: AudioUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      onFileSelect(droppedFile);
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const handleRemove = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  if (file) {
    return (
      <div className="glass-panel p-4 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Track {trackNumber}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={handleRemove}
            disabled={isAnalyzing}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            "bg-gradient-to-br from-primary/20 to-secondary/20",
            isAnalyzing && "animate-pulse"
          )}>
            <FileAudio className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
        
        {isAnalyzing && (
          <div className="mt-3">
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary animate-shimmer"
                style={{ width: '100%', backgroundSize: '200% 100%' }}
              />
            </div>
            <p className="text-xs text-primary mt-2 font-mono">Analyzing audio...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "upload-zone p-6 cursor-pointer transition-all duration-300",
        isDragOver && "dragover"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
        id={`audio-upload-${trackNumber}`}
      />
      <label 
        htmlFor={`audio-upload-${trackNumber}`}
        className="flex flex-col items-center gap-4 cursor-pointer"
      >
        <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          {trackNumber === 1 ? (
            <Upload className="w-7 h-7 text-muted-foreground" />
          ) : (
            <Music2 className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium mb-1">
            {trackNumber === 1 ? "Drop your first track" : "Add second track (optional)"}
          </p>
          <p className="text-xs text-muted-foreground">
            MP3, WAV, FLAC, or M4A
          </p>
        </div>
      </label>
    </div>
  );
}
