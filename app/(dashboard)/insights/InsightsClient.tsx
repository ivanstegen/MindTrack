'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { TrendingUp, Calendar, Target, Smile } from 'lucide-react'
import { useState } from 'react'

interface JournalEntry {
  entry_date: string
  text: string
  mood_label: string | null
  mood_score: number | null
}

interface HabitHistory {
  date: string
  completed: boolean
}

interface Habit {
  id: string
  name: string
  streak: number
  best_streak: number
  habit_history: HabitHistory[]
}

interface InsightsClientProps {
  journalEntries: JournalEntry[]
  habits: Habit[]
}

export function InsightsClient({ journalEntries, habits }: InsightsClientProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  // Filter data based on time range
  const getFilteredEntries = () => {
    const now = new Date()
    switch (timeRange) {
      case 'week':
        return journalEntries.filter(e => 
          new Date(e.entry_date) >= subDays(now, 7)
        )
      case 'month':
        return journalEntries.filter(e => 
          new Date(e.entry_date) >= startOfMonth(now) &&
          new Date(e.entry_date) <= endOfMonth(now)
        )
      default:
        return journalEntries
    }
  }

  const filteredEntries = getFilteredEntries()

  // Mood over time
  const moodOverTime = filteredEntries
    .filter(e => e.mood_score)
    .reverse()
    .map(entry => ({
      date: format(new Date(entry.entry_date), 'MMM dd'),
      mood: entry.mood_score,
      label: entry.mood_label,
    }))

  // Mood distribution
  const moodCounts = filteredEntries.reduce((acc: Record<string, number>, entry) => {
    if (entry.mood_label) {
      acc[entry.mood_label] = (acc[entry.mood_label] || 0) + 1
    }
    return acc
  }, {})

  const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: count,
  }))

  const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1']

  // Habit completion rate over time
  const habitCompletionData = habits.map(habit => {
    const totalDays = habit.habit_history.length
    const completedDays = habit.habit_history.filter(h => h.completed).length
    return {
      name: habit.name.length > 20 ? habit.name.substring(0, 20) + '...' : habit.name,
      completion: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
      streak: habit.streak,
      bestStreak: habit.best_streak,
    }
  })

  // Word frequency analysis
  const getWordFrequency = () => {
    const words: Record<string, number> = {}
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'am', 'are', 'can'])

    filteredEntries.forEach(entry => {
      const text = entry.text.toLowerCase()
      const matches = text.match(/\b[a-z]{4,}\b/g) || []
      matches.forEach(word => {
        if (!stopWords.has(word)) {
          words[word] = (words[word] || 0) + 1
        }
      })
    })

    return Object.entries(words)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }))
  }

  const wordFrequency = getWordFrequency()

  // Stats
  const avgMood = filteredEntries.length > 0
    ? filteredEntries.reduce((sum, e) => sum + (e.mood_score || 0), 0) / filteredEntries.filter(e => e.mood_score).length
    : 0

  const totalEntries = filteredEntries.length
  const habitCompletionRate = habits.length > 0
    ? Math.round(habitCompletionData.reduce((sum, h) => sum + h.completion, 0) / habits.length)
    : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Insights & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize your mental wellness journey
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`
                px-4 py-2 rounded-md font-medium transition-colors capitalize
                ${timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Smile className="w-8 h-8" />
            <span className="text-sm opacity-80">Average</span>
          </div>
          <p className="text-4xl font-bold mb-1">{avgMood.toFixed(1)}/10</p>
          <p className="text-sm opacity-90">Mood Score</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8" />
            <span className="text-sm opacity-80">Total</span>
          </div>
          <p className="text-4xl font-bold mb-1">{totalEntries}</p>
          <p className="text-sm opacity-90">Journal Entries</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8" />
            <span className="text-sm opacity-80">Average</span>
          </div>
          <p className="text-4xl font-bold mb-1">{habitCompletionRate}%</p>
          <p className="text-sm opacity-90">Habit Completion</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Mood Trend Over Time
          </h2>
          {moodOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodOverTime}>
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
                  dot={{ fill: '#8B5CF6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No data available for this time range
            </div>
          )}
        </div>

        {/* Mood Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Mood Distribution
          </h2>
          {moodDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No mood data available
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Habit Completion Rates
          </h2>
          {habitCompletionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={habitCompletionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
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
                <Bar dataKey="completion" fill="#10B981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No habit data available
            </div>
          )}
        </div>

        {/* Word Frequency */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Most Used Words in Journal
          </h2>
          {wordFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wordFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="word" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Not enough journal data
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
