# 🧠 MindTrack - AI-Powered Mental Fitness Coach

![MindTrack Banner](https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=300&fit=crop)

**Transform your mental well-being through AI-powered journaling, habit tracking, and personalized insights.**

## 🎯 Overview

MindTrack is a comprehensive mental wellness application that combines modern web technologies with AI to help users improve their mental health. The app provides:

- 📝 **Smart Journaling** with AI sentiment analysis
- 🎯 **Habit Tracking** with streak management
- 📊 **Analytics Dashboard** with mood trends and insights
- 💬 **AI Wellness Coach** for personalized guidance
- 🌓 **Dark/Light Theme** support
- 🔒 **Secure Authentication** with row-level security

## ✨ Features

### Core Features
- ✅ User authentication (Email + Password)
- ✅ Daily journaling with AI-powered sentiment analysis
- ✅ Habit tracking with streak counters
- ✅ Personalized challenges based on mood trends
- ✅ Interactive analytics dashboard with charts
- ✅ AI chatbot for mental health guidance
- ✅ Responsive mobile-first design
- ✅ Dark/Light theme toggle

### AI Features
- 🤖 Real-time sentiment analysis using OpenAI GPT-3.5
- 💭 Context-aware AI coaching based on your mood history
- 📈 Automatic challenge generation based on mood patterns
- 🔍 Word frequency analysis from journal entries

### Security
- 🔐 Row-level security (RLS) on all user data
- 🛡️ Secure API routes with Supabase Auth
- 🚫 Input sanitization and validation
- 🔒 Environment variable protection

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide Icons** - Beautiful icons
- **Zustand** - State management
- **next-themes** - Theme management

### Backend & Infrastructure
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Row-Level Security (RLS)
  - Edge Functions (Deno)
- **OpenAI API** - AI sentiment analysis and coaching

### Deployment
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend & database

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account ([sign up](https://supabase.com))
- OpenAI API key ([get one](https://platform.openai.com/api-keys))

### Step 1: Clone and Install

```powershell
# Clone the repository
git clone <your-repo-url>
cd mindtrack

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

3. Run the database migration:
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy the contents of `supabase/migrations/20241028000000_initial_schema.sql`
   - Execute the SQL

### Step 3: Deploy Edge Functions

```powershell
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy Edge Functions
supabase functions deploy analyzeSentiment
supabase functions deploy chatCoach

# Set OpenAI API key for Edge Functions
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (for Edge Functions)
OPENAI_API_KEY=your_openai_api_key
```

### Step 5: Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
4. Deploy!

### Configure Supabase for Production

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Site URL** and **Redirect URLs**

## 📁 Project Structure

```
mindtrack/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Main dashboard
│   │   ├── journal/          # Journal entries
│   │   ├── habits/           # Habit tracking
│   │   ├── insights/         # Analytics & insights
│   │   ├── chat/             # AI chatbot
│   │   ├── settings/         # User settings
│   │   └── layout.tsx        # Dashboard layout
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/
│   ├── layout/               # Layout components
│   └── providers/            # Context providers
├── lib/
│   ├── supabase/             # Supabase client utilities
│   └── store/                # Zustand stores
├── supabase/
│   ├── functions/            # Edge Functions
│   │   ├── analyzeSentiment/ # Sentiment analysis
│   │   └── chatCoach/        # AI coaching
│   └── migrations/           # Database migrations
├── .env.local                # Environment variables (create this)
├── .env.example              # Example env file
├── middleware.ts             # Auth middleware
├── package.json              # Dependencies
└── README.md                 # This file
```

## 📊 Database Schema

### Tables

**journal_entries**
- Primary key: (user_id, entry_date)
- Stores daily journal entries with AI-analyzed mood

**habits**
- Tracks user habits with streak counters
- Links to habit_history for daily completions

**habit_history**
- Records daily habit completions
- Primary key: (habit_id, date)

**challenges**
- Stores active and completed challenges
- Auto-generated based on mood trends

### Row-Level Security (RLS)

All tables have RLS policies ensuring users can only access their own data:
- `SELECT`: Users can view their own records
- `INSERT`: Users can create their own records
- `UPDATE`: Users can update their own records
- `DELETE`: Users can delete their own records

## 🤖 AI Features

### Sentiment Analysis

The `analyzeSentiment` Edge Function uses OpenAI GPT-3.5 to:
- Analyze journal entry text
- Return mood label (happy, sad, anxious, neutral, etc.)
- Provide mood score (1-10)

### AI Coach

The `chatCoach` Edge Function provides:
- Context-aware responses based on mood history
- Personalized advice and encouragement
- Real-time streaming responses
- Integration with active challenges

### Smart Behavior

- **Auto-challenges**: If mood drops for 3+ consecutive days, app suggests relaxation activities
- **Streak encouragement**: Notifications when habit streaks are maintained
- **Mood insights**: Pattern recognition in journal entries

## 🎨 Customization

### Changing Theme Colors

Edit `tailwind.config.ts` to customize the color palette:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#8B5CF6', // Purple
      secondary: '#EC4899', // Pink
      // Add your colors
    }
  }
}
```

### Adding New Features

1. Create new route in `app/(dashboard)/`
2. Add navigation link in `components/layout/DashboardLayout.tsx`
3. Create necessary database tables/functions
4. Update RLS policies

## 🔧 Troubleshooting

### Issue: "Failed to load environment variables"
- Ensure `.env.local` file exists in root directory
- Restart dev server after adding environment variables

### Issue: "Supabase client error"
- Check that your Supabase URL and keys are correct
- Verify RLS policies are enabled on all tables

### Issue: "AI features not working"
- Confirm OpenAI API key is set in Supabase secrets
- Check Edge Function deployment status
- Verify API key has credits remaining

### Issue: "Authentication not working"
- Clear browser cookies and local storage
- Check Supabase Auth settings (Site URL, Redirect URLs)
- Verify middleware.ts is properly configured

## 📈 Future Enhancements

- [ ] PWA support for offline access
- [ ] Voice journaling with speech-to-text
- [ ] Community challenges and friend connections
- [ ] Export data as PDF/CSV
- [ ] Mobile app (React Native)
- [ ] Crisis detection with emergency resources
- [ ] Integration with wearables (mood tracking)
- [ ] Multi-language support

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend platform
- **OpenAI** for AI capabilities
- **Vercel** for seamless deployment
- **Next.js** team for the excellent framework

## 💬 Support

If you have questions or need help:
1. Check the [troubleshooting](#-troubleshooting) section
2. Open an issue on GitHub
3. Contact: your-email@example.com

## 🌟 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Made with ❤️ for mental wellness

**Remember**: This app is a tool to support your mental health journey, not a replacement for professional mental health care. If you're experiencing a mental health crisis, please contact a professional or crisis hotline.
