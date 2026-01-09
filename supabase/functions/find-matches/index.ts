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
    const { analysis, mode } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Finding matches for mode: ${mode}, analysis:`, analysis ? `${analysis.bpm} BPM, ${analysis.key}` : 'none');

    const systemPrompt = mode === 'discovery' 
      ? `You are an expert DJ and music curator. Suggest 2 perfectly matched techno tracks that would work well together for a remix. Consider harmonic compatibility (Camelot wheel), BPM matching, energy levels, and style compatibility.`
      : `You are an expert DJ and music curator. Given the analysis of a track, suggest 4-5 compatible songs for harmonic mixing. Use the Camelot wheel for key matching - compatible keys are the same key, +/-1 on the wheel, or the relative major/minor.`;

    const userPrompt = mode === 'discovery'
      ? `Suggest 2 real techno tracks that would work perfectly together for a remix. They should be:
- From well-known techno producers
- Harmonically compatible (matching or compatible Camelot keys)
- Similar BPM range (within 5 BPM)
- Complementary energy and style

Return exactly 2 track suggestions with full details.`
      : `Find compatible tracks for mixing with this song:
- BPM: ${analysis.bpm}
- Key: ${analysis.key} (${analysis.camelotKey})
- Mode: ${analysis.mode}
- Energy: ${Math.round(analysis.energy * 100)}%

Suggest 4-5 real techno tracks that would mix well. They should be harmonically compatible and have similar energy levels.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_song_matches',
              description: 'Provide a list of compatible song matches',
              parameters: {
                type: 'object',
                properties: {
                  matches: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: 'Song title' },
                        artist: { type: 'string', description: 'Artist name' },
                        bpm: { type: 'number', description: 'BPM of the track' },
                        key: { type: 'string', description: 'Musical key (e.g., Am, Cm)' },
                        camelotKey: { type: 'string', description: 'Camelot wheel key' },
                        genre: { type: 'string', description: 'Main genre' },
                        subGenre: { type: 'string', description: 'Sub-genre or style' },
                        energyLevel: { type: 'number', description: 'Energy level 0-100' },
                        compatibilityScore: { type: 'number', description: 'Match score 0-100' },
                        matchReason: { type: 'string', description: 'Technical explanation of why this matches' }
                      },
                      required: ['title', 'artist', 'bpm', 'key', 'camelotKey', 'genre', 'subGenre', 'energyLevel', 'compatibilityScore', 'matchReason']
                    }
                  }
                },
                required: ['matches']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_song_matches' } }
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
    console.log('AI response received');
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Add IDs to matches
    const matches = result.matches.map((match: any, index: number) => ({
      ...match,
      id: `match-${Date.now()}-${index}`
    }));

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('find-matches error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
