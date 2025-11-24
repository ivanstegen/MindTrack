# Supabase Edge Functions

These functions run on **Deno** (not Node.js) in Supabase's edge runtime. The TypeScript errors you see in VS Code are expected because your IDE is configured for Node.js.

## 🚀 Deployment

Deploy these functions using the Supabase CLI:

```powershell
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy analyzeSentiment
supabase functions deploy chatCoach

# Or deploy all at once
supabase functions deploy
```

## 🔑 Set Secrets

```powershell
supabase secrets set OPENAI_API_KEY=your-openai-api-key
```

## 📋 Available Functions

### 1. analyzeSentiment
Analyzes journal text and returns mood classification.

**Endpoint:** `POST /functions/v1/analyzeSentiment`

**Request:**
```json
{
  "text": "I had a great day today!"
}
```

**Response:**
```json
{
  "mood_label": "happy",
  "mood_score": 8
}
```

### 2. chatCoach
AI wellness coach with streaming responses.

**Endpoint:** `POST /functions/v1/chatCoach`

**Request:**
```json
{
  "message": "How can I reduce stress?",
  "moodHistory": [...],
  "recentJournal": [...],
  "activeChallenges": [...]
}
```

**Response:** Server-Sent Events (streaming)

## 🧪 Testing Functions Locally

```powershell
# Start local Supabase (requires Docker)
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/analyzeSentiment `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -H "Content-Type: application/json" `
  -d '{"text":"Today was great!"}'
```

## 📝 Notes

- **Deno vs Node.js**: These files use Deno imports (URLs) instead of npm packages
- **TypeScript Errors**: VS Code shows errors because it's checking with Node.js types
- **Runtime**: Functions run on Supabase Edge, not in your Next.js app
- **Deployment**: Use Supabase CLI, not npm/Vercel

## 🔍 Viewing Logs

```powershell
# View function logs
supabase functions logs analyzeSentiment

# Stream logs in real-time
supabase functions logs chatCoach --follow
```

## 📖 Learn More

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
