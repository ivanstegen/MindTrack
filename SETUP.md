# 🚀 Quick Setup Guide - MindTrack

This guide will help you get MindTrack up and running in under 15 minutes.

## ⚡ Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Supabase Account** - [Sign up free](https://supabase.com)
- **OpenAI API Key** - [Get yours](https://platform.openai.com/api-keys)

## 📋 Step-by-Step Setup

### 1. Install Dependencies

```powershell
cd mindtrack
npm install
```

### 2. Set Up Supabase Project

1. **Create a new project** at [supabase.com](https://supabase.com/dashboard)
   - Choose a project name
   - Set a strong database password
   - Select your region

2. **Get your API credentials**:
   - Go to **Settings** → **API**
   - Copy these values:
     - `Project URL`
     - `anon public` key
     - `service_role` key (secret!)

3. **Run the database migration**:
   - Go to **SQL Editor** in Supabase Dashboard
   - Click **New Query**
   - Copy entire contents from `supabase/migrations/20241028000000_initial_schema.sql`
   - Click **Run** to execute

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```env
# From Supabase Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# From OpenAI Platform
OPENAI_API_KEY=sk-your-openai-key-here
```

### 4. Deploy Supabase Edge Functions

```powershell
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize Supabase in your project
supabase init

# Link to your project (get ref from Supabase dashboard URL)
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy analyzeSentiment
supabase functions deploy chatCoach

# Set secrets for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-your-openai-key-here
```

### 5. Configure Supabase Authentication

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/dashboard
   http://localhost:3000/auth/callback
   ```
3. Set **Site URL**: `http://localhost:3000`

### 6. Run the Development Server

```powershell
npm run dev
```

Visit **http://localhost:3000** 🎉

## ✅ Verify Installation

1. **Create an account** at `/register`
2. **Write a journal entry** - AI should analyze sentiment
3. **Create a habit** - Test completion toggle
4. **Chat with AI coach** - Should get responses
5. **Check insights** - View charts and analytics

## 🔧 Troubleshooting

### Error: "Supabase client not configured"
- Double-check `.env.local` file exists
- Verify Supabase URL and keys are correct
- Restart dev server: `Ctrl+C` then `npm run dev`

### Error: "Failed to analyze sentiment"
- Verify Edge Functions are deployed: `supabase functions list`
- Check OpenAI API key is set: `supabase secrets list`
- Ensure you have OpenAI API credits

### Error: "Authentication failed"
- Check Supabase Auth redirect URLs
- Clear browser cache and cookies
- Verify email confirmation is disabled for testing:
  - Go to **Authentication** → **Settings**
  - Disable **"Confirm email"** for development

### Database RLS Errors
- Make sure you ran the migration SQL completely
- Verify RLS is enabled on all tables
- Check that policies were created

## 📦 Deploy to Production

### Deploy Frontend (Vercel)

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add production URLs to Supabase Auth settings
```

### Update Supabase for Production

1. **Authentication** → **URL Configuration**
   - Add your Vercel domain: `https://your-app.vercel.app`
   - Add to redirect URLs

2. **Edge Functions** already deployed ✅

## 🎯 Next Steps

1. **Customize** - Edit colors in `tailwind.config.ts`
2. **Add features** - Check `README.md` for ideas
3. **Monitor** - Use Supabase Dashboard to view usage
4. **Share** - Invite friends to test!

## 💡 Tips

- **Use real emails** for testing to receive notifications
- **Journal daily** for 7+ days to see meaningful insights
- **Create multiple habits** to test streak tracking
- **Chat regularly** with AI coach for personalized advice
- **Check Insights page** after accumulating data

## 🆘 Need Help?

- Check the main [README.md](./README.md) for detailed docs
- Review [Supabase Docs](https://supabase.com/docs)
- Check [Next.js Docs](https://nextjs.org/docs)
- Open an issue on GitHub

---

**Happy building! 🚀**
