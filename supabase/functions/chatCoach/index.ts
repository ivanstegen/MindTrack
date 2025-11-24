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
    const { message, conversationHistory, moodHistory, recentJournal, activeChallenges } = await req.json();

    // Build context for the AI coach
    let systemContext = `You are a compassionate mental wellness coach for the MindTrack app. 
Provide supportive, encouraging, and actionable advice.`;

    if (moodHistory && moodHistory.length > 0) {
      const avgMood = moodHistory.reduce((sum: number, m: any) => sum + (m.mood_score || 0), 0) / moodHistory.length;
      systemContext += `\n\nUser's recent mood trend: Average score ${avgMood.toFixed(1)}/10 over the last ${moodHistory.length} entries.`;
      
      const recentMoods = moodHistory.slice(0, 3).map((m: any) => m.mood_label).filter(Boolean).join(', ');
      if (recentMoods) {
        systemContext += `\nRecent moods: ${recentMoods}`;
      }
    }

    if (recentJournal && recentJournal.length > 0) {
      systemContext += `\n\nRecent journal themes: User has been reflecting on personal growth and daily experiences.`;
    }

    if (activeChallenges && activeChallenges.length > 0) {
      systemContext += `\n\nActive challenges: ${activeChallenges.map((c: any) => c.description).join(', ')}`;
    }

    systemContext += `\n\nRespond naturally and adapt your response length to what's needed. Give brief acknowledgments when appropriate, but provide comprehensive, detailed advice when the situation calls for it. Elaborate on techniques, strategies, or explanations when it helps the user better understand or apply your guidance. Always be empathetic and supportive.`;

    // Build conversation contents for Gemini
    const contents = [];
    
    // Add system context as first user message
    contents.push({
      role: 'user',
      parts: [{ text: systemContext }]
    });
    
    // Add conversation history if present
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));
    
    // Extract content even if MAX_TOKENS was hit (response might be partial but usable)
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Only block on SAFETY or RECITATION issues
    if (!content || content.trim() === '') {
      const finishReason = data.candidates?.[0]?.finishReason;
      
      if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
        console.error('Gemini response blocked:', finishReason);
      } else {
        console.error('No content in response:', JSON.stringify(data));
      }
      
      // Fallback response
      const fallbackContent = "I understand you're reaching out. Could you tell me more about what's on your mind today?";
      
      // Return fallback as streaming
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: fallbackContent } }] })}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Return as simulated streaming for compatibility with frontend
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = content.split(' ');
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            const chunk = (i === 0 ? words[i] : ' ' + words[i]);
            const sseData = `data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
            i++;
          } else {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            clearInterval(interval);
          }
        }, 50);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
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
