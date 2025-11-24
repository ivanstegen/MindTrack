'use client'

import { TrendingUp, TrendingDown, Target, BookOpen, Flame, Trophy, Smile, Frown, Meh } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'
import Link from 'next/link'

interface JournalEntry {
  entry_date: string
  mood_label: string | null
  mood_score: number | null
}

interface Habit {
  id: string
  name: string
  streak: number
}

interface Challenge {
  id: string
  description: string
}

interface DashboardClientProps {
  journalEntries: JournalEntry[]
  habits: Habit[]
  challenges: Challenge[]
}

export function DashboardClient({ journalEntries, habits, challenges }: DashboardClientProps) {
  // Calculate statistics
  const totalEntries = journalEntries.length
  const recentEntries = journalEntries.slice(0, 7)
  const avgMood = recentEntries.length > 0
    ? recentEntries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / recentEntries.length
    : 0

  const totalHabits = habits.length
  const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0

  // Mood trend data
  const moodTrendData = recentEntries.reverse().map(entry => ({
    date: format(new Date(entry.entry_date), 'MMM dd'),
    mood: entry.mood_score || 0,
  }))

  // Mood distribution
  const moodCounts = journalEntries.reduce((acc: Record<string, number>, entry) => {
    if (entry.mood_label) {
      acc[entry.mood_label] = (acc[entry.mood_label] || 0) + 1
    }
    return acc
  }, {})

  const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    count,
  }))

  const getMoodIcon = (score: number | null) => {
    if (!score) return <Meh className="w-5 h-5 text-gray-400" />
    if (score >= 8) return <Smile className="w-5 h-5 text-green-500" />
    if (score >= 5) return <Meh className="w-5 h-5 text-yellow-500" />
    return <Frown className="w-5 h-5 text-red-500" />
  }

  const getMoodTrend = () => {
    if (recentEntries.length < 2) return null
    const recent = recentEntries[0].mood_score || 0
    const previous = recentEntries[1].mood_score || 0
    const diff = recent - previous
    
    if (diff > 0) return { icon: TrendingUp, text: 'Improving', color: 'text-green-500' }
    if (diff < 0) return { icon: TrendingDown, text: 'Declining', color: 'text-red-500' }
    return { icon: Meh, text: 'Stable', color: 'text-gray-500' }
  }

  const moodTrend = getMoodTrend()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here&apos;s your mental wellness overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Journal Entries"
          value={totalEntries}
          icon={<BookOpen className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Average Mood"
          value={avgMood.toFixed(1)}
          icon={getMoodIcon(avgMood)}
          color="bg-purple-500"
          suffix="/10"
          trend={moodTrend}
        />
        <StatCard
          title="Active Habits"
          value={totalHabits}
          icon={<Target className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Best Streak"
          value={bestStreak}
          icon={<Flame className="w-6 h-6" />}
          color="bg-orange-500"
          suffix=" days"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            7-Day Mood Trend
          </h2>
          {moodTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={[0, 10]}
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No mood data yet. Start journaling!
            </div>
          )}
        </div>

        {/* Mood Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Mood Distribution
          </h2>
          {moodDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={moodDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="mood" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#EC4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              No mood data yet. Start journaling!
            </div>
          )}
        </div>
      </div>

      {/* Active Challenges & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Challenges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Active Challenges
            </h2>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          {challenges.length > 0 ? (
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                >
                  <p className="text-gray-900 dark:text-white">{challenge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No active challenges. Keep journaling to get personalized challenges!
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link 
              href="/journal"
              className="block p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Write Journal Entry</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reflect on your day</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/habits"
              className="block p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Track Habits</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Build positive routines</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/chat"
              className="block p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Chat with Coach</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized guidance</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: string
  suffix?: string
  trend?: { icon: any; text: string; color: string } | null
}

function StatCard({ title, value, icon, color, suffix = '', trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}{suffix}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 ${trend.color}`}>
              <trend.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{trend.text}</span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
