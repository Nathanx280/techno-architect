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
    const { analysis1, analysis2, settings } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating remix with settings:`, settings);
    console.log(`Track 1:`, analysis1 ? `${analysis1.bpm} BPM, ${analysis1.key}` : 'none');
    console.log(`Track 2:`, analysis2 ? `${analysis2.bpm} BPM, ${analysis2.key}` : 'none');

    const hasTwoTracks = !!analysis2;

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
            content: `You are an expert techno music producer and remix engineer. You create professional-grade club remixes with:
- Proper 4/4 club structure
- Rolling low-end with tight kick-bass relationship
- Tension builders and risers
- Clean, powerful drops
- DJ-friendly intro/outro for mixing

Generate a detailed remix plan that transforms the input track(s) into a ${settings.style.replace('-', ' ')} techno remix.`
          },
          {
            role: 'user',
            content: `Create a remix plan for:

${hasTwoTracks ? `TRACK 1: ${analysis1.fileName}
- BPM: ${analysis1.bpm}
- Key: ${analysis1.key} (${analysis1.camelotKey})
- Energy: ${Math.round(analysis1.energy * 100)}%

TRACK 2: ${analysis2.fileName}
- BPM: ${analysis2.bpm}  
- Key: ${analysis2.key} (${analysis2.camelotKey})
- Energy: ${Math.round(analysis2.energy * 100)}%` : `TRACK: ${analysis1.fileName}
- BPM: ${analysis1.bpm}
- Key: ${analysis1.key} (${analysis1.camelotKey})
- Energy: ${Math.round(analysis1.energy * 100)}%`}

REMIX SETTINGS:
- Target BPM: ${settings.targetBpm}
- Energy Intensity: ${Math.round(settings.energyIntensity * 100)}%
- Darkness/Aggression: ${Math.round(settings.darkness * 100)}%
- Drop Length: ${settings.dropLength} seconds
- Vocal Presence: ${settings.vocalPresence}
- Style: ${settings.style.replace('-', ' ')}

Generate a detailed remix timeline and list of changes. The remix should be approximately 5-7 minutes for club play.`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_remix_plan',
              description: 'Generate a detailed remix plan with timeline and changes',
              parameters: {
                type: 'object',
                properties: {
                  timeline: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', description: 'Section type (intro, buildup, drop, breakdown, outro)' },
                        startTime: { type: 'number', description: 'Start time in seconds' },
                        endTime: { type: 'number', description: 'End time in seconds' },
                        source: { type: 'string', enum: ['track1', 'track2', 'generated'], description: 'Source of material' },
                        description: { type: 'string', description: 'What happens in this section' }
                      },
                      required: ['type', 'startTime', 'endTime', 'source', 'description']
                    }
                  },
                  changes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['cut', 'extend', 'add', 'remove', 'transform'], description: 'Type of change' },
                        description: { type: 'string', description: 'Description of the change' },
                        timestamp: { type: 'number', description: 'When this change occurs' }
                      },
                      required: ['type', 'description', 'timestamp']
                    }
                  },
                  duration: { type: 'number', description: 'Total duration in seconds' },
                  keyAdjustment: { type: 'string', description: 'Key adjustment applied if any' },
                  bpmAdjustment: { type: 'string', description: 'BPM adjustment applied' }
                },
                required: ['timeline', 'changes', 'duration']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_remix_plan' } }
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
    console.log('AI remix plan received');
    
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const remixPlan = JSON.parse(toolCall.function.arguments);

    const result = {
      id: `remix-${Date.now()}`,
      audioUrl: '/remix-output.wav', // Placeholder - would be actual audio in production
      timeline: remixPlan.timeline,
      changes: remixPlan.changes,
      duration: remixPlan.duration || 360,
      keyAdjustment: remixPlan.keyAdjustment,
      bpmAdjustment: remixPlan.bpmAdjustment
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('generate-remix error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
