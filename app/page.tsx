import Link from 'next/link'
import { Brain, LineChart, Target, MessageCircle, Calendar, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">MindTrack</span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-300">AI-Powered Mental Wellness</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Personal
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Mental Fitness </span>
              Coach
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Transform your mental well-being through AI-powered journaling, habit tracking, and personalized insights. 
              Start your journey to a healthier mind today.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/register" 
                className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg text-lg font-semibold"
              >
                Start Free Today
              </Link>
              <Link 
                href="#features" 
                className="px-8 py-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-lg hover:shadow-lg transition-all text-lg font-semibold border border-purple-200 dark:border-purple-800"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed to help you understand and improve your mental health
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Smart Journaling"
              description="Write daily entries with AI-powered sentiment analysis to track your emotional patterns over time."
              color="purple"
            />
            <FeatureCard
              icon={<Target className="w-8 h-8" />}
              title="Habit Tracking"
              description="Build positive habits, track streaks, and receive encouragement to maintain your progress."
              color="pink"
            />
            <FeatureCard
              icon={<LineChart className="w-8 h-8" />}
              title="Mood Analytics"
              description="Visualize your emotional trends with beautiful charts and gain insights into your mental patterns."
              color="blue"
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title="AI Coach"
              description="Get personalized guidance and support from your AI wellness coach, available 24/7."
              color="green"
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Daily Challenges"
              description="Receive personalized mindset challenges based on your mood trends to keep you motivated."
              color="yellow"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Insights & Tips"
              description="Discover patterns in your behavior and receive actionable tips for better mental health."
              color="indigo"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Mental Wellness?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users improving their mental fitness with MindTrack
            </p>
            <Link 
              href="/register" 
              className="inline-block px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg font-semibold"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <span className="text-xl font-bold">MindTrack</span>
        </div>
        <p>&copy; 2024 MindTrack. All rights reserved.</p>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <div className={`w-16 h-16 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}
