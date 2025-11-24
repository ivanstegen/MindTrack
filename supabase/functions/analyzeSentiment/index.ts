/// <reference path="../deno.d.ts" />
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }

    // Call Gemini API for sentiment analysis
    const prompt = `You are a sentiment analysis expert for a mental health journaling app. 
Analyze the given journal entry and respond with ONLY a JSON object in this exact format:
{
  "mood_label": "happy|sad|anxious|neutral|excited|calm|stressed",
  "mood_score": <number 1-10>
}

Where:
- mood_score: 1-3 = very negative, 4-5 = somewhat negative, 6-7 = neutral/ok, 8-9 = positive, 10 = very positive
- mood_label: choose the most fitting emotion from the list

Respond with ONLY the JSON object, no additional text.

Journal entry: ${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini sentiment response:', JSON.stringify(data));
    
    // Extract content even if MAX_TOKENS was hit
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Only return default if there's truly no content or it's blocked for safety
    if (!content || content.trim() === '') {
      const finishReason = data.candidates?.[0]?.finishReason;
      console.error('No content in response. Finish reason:', finishReason);
      
      // Return default neutral sentiment if no content
      return new Response(
        JSON.stringify({ mood_label: 'neutral', mood_score: 5 }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          } 
        }
      );
    }
    
    // Parse the JSON response (remove markdown code blocks if present)
    const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
    const sentimentResult = JSON.parse(cleanContent);

    // Ensure mood_score is a number
    const result = {
      mood_label: sentimentResult.mood_label,
      mood_score: Number(sentimentResult.mood_score)
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
});
