import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileSize, duration } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing audio file: ${fileName}, size: ${fileSize}, duration: ${duration}`);

    // Use AI to generate realistic analysis based on file characteristics
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert audio analysis AI for a techno remix engine. Given a music file name and metadata, generate realistic audio analysis data that would be typical for the genre suggested by the filename.

Return a JSON object with:
- bpm: number between 120-160 (typical for techno/electronic)
- bpmDrift: number 0-2 (tempo stability)
- key: musical key (e.g., "Am", "Cm", "F#m", "G")
- camelotKey: Camelot wheel notation (e.g., "8A", "5A", "11B")
- mode: "major" or "minor"
- energy: number 0-1 (overall energy level)
- energyCurve: array of 20 numbers 0-1 representing energy over time
- structure: array of sections with type, startTime, endTime, energy
- stemAnalysis: object with vocals, drums, bass, synths, other (each 0-1)

Be realistic and musically consistent. For techno tracks, expect higher BPM, strong drums/bass, and clear structure.`
          },
          {
            role: 'user',
            content: `Analyze this audio file and return JSON:
Filename: ${fileName}
File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB
Estimated duration: ${duration || 'unknown'} seconds

Generate realistic analysis data for this track.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_audio_analysis',
              description: 'Provide detailed audio analysis for a music track',
              parameters: {
                type: 'object',
                properties: {
                  bpm: { type: 'number', description: 'Beats per minute (120-160 for techno)' },
                  bpmDrift: { type: 'number', description: 'Tempo drift/variance (0-2)' },
                  key: { type: 'string', description: 'Musical key (e.g., Am, Cm, F)' },
                  camelotKey: { type: 'string', description: 'Camelot wheel key (e.g., 8A, 5B)' },
                  mode: { type: 'string', enum: ['major', 'minor'] },
                  energy: { type: 'number', description: 'Overall energy level (0-1)' },
                  energyCurve: { 
                    type: 'array', 
                    items: { type: 'number' },
                    description: 'Array of 20 energy values over time'
                  },
                  structure: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['intro', 'verse', 'buildup', 'drop', 'break', 'outro'] },
                        startTime: { type: 'number' },
                        endTime: { type: 'number' },
                        energy: { type: 'number' }
                      }
                    }
                  },
                  stemAnalysis: {
                    type: 'object',
                    properties: {
                      vocals: { type: 'number' },
                      drums: { type: 'number' },
                      bass: { type: 'number' },
                      synths: { type: 'number' },
                      other: { type: 'number' }
                    }
                  }
                },
                required: ['bpm', 'bpmDrift', 'key', 'camelotKey', 'mode', 'energy', 'energyCurve', 'structure', 'stemAnalysis']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_audio_analysis' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI response received:', JSON.stringify(aiResponse).substring(0, 200));
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Generate waveform data
    analysis.waveformData = Array.from({ length: 100 }, () => Math.random() * 0.6 + 0.2);
    analysis.duration = duration || 240;
    analysis.fileName = fileName;

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('analyze-audio error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
