'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'
import { format } from 'date-fns'
import { BookOpen, Loader2, Sparkles, Calendar, Smile, Frown, Meh, AlertCircle } from 'lucide-react'

interface JournalEntry {
  user_id: string
  entry_date: string
  text: string
  mood_label: string | null
  mood_score: number | null
  created_at: string
}

interface JournalClientProps {
  initialEntries: JournalEntry[]
}

export function JournalClient({ initialEntries }: JournalClientProps) {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [text, setText] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !user) return

    setLoading(true)
    setAnalyzing(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()

      // Call sentiment analysis Edge Function
      let mood_label = null
      let mood_score = null

      try {
        const sentimentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyzeSentiment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ text }),
          }
        )

        if (sentimentResponse.ok) {
          const sentiment = await sentimentResponse.json()
          mood_label = sentiment.mood_label
          mood_score = sentiment.mood_score
        }
      } catch (error) {
        console.error('Sentiment analysis failed, continuing without it:', error)
        // Continue saving without AI analysis
      }

      setAnalyzing(false)

      // Save journal entry
      const { data, error: dbError } = await supabase
        .from('journal_entries')
        .upsert({
          user_id: user.id,
          entry_date: selectedDate,
          text,
          mood_label,
          mood_score,
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update local state
      const existingIndex = entries.findIndex(e => e.entry_date === selectedDate)
      if (existingIndex >= 0) {
        const newEntries = [...entries]
        newEntries[existingIndex] = data
        setEntries(newEntries)
      } else {
        setEntries([data, ...entries])
      }

      setText('')
      setSuccess('Journal entry saved successfully!')
      
      // Check for auto-challenges based on mood trends
      await checkMoodTrends()
    } catch (error: any) {
      setError(error.message || 'Failed to save journal entry')
    } finally {
      setLoading(false)
      setAnalyzing(false)
    }
  }

  const checkMoodTrends = async () => {
    if (!user) return

    const supabase = createClient()
    const recentEntries = entries.slice(0, 3)
    
    if (recentEntries.length >= 3) {
      const avgMood = recentEntries.reduce((sum, e) => sum + (e.mood_score || 0), 0) / 3
      
      // If mood is declining, create a challenge
      if (avgMood < 5) {
        const { data: existingChallenge } = await supabase
          .from('challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (!existingChallenge) {
          await supabase
            .from('challenges')
            .insert({
              user_id: user.id,
              description: 'Take a 10-minute relaxing break today. Practice deep breathing or listen to calming music.',
              status: 'active',
              challenge_type: 'mood_based',
            })
        }
      }
    }
  }

  const getMoodIcon = (score: number | null) => {
    if (!score) return <Meh className="w-5 h-5 text-gray-400" />
    if (score >= 8) return <Smile className="w-5 h-5 text-green-500" />
    if (score >= 5) return <Meh className="w-5 h-5 text-yellow-500" />
    return <Frown className="w-5 h-5 text-red-500" />
  }

  const getMoodColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 dark:bg-gray-700'
    if (score >= 8) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    if (score >= 5) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Journal
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Write your thoughts and let AI analyze your mood
        </p>
      </div>

      {/* Write Entry Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Write Entry
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How was your day?
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Write about your thoughts, feelings, and experiences..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                Analyzing mood...
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Save & Analyze
              </>
            )}
          </button>
        </form>
      </div>

      {/* Entries History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Entry History
        </h2>

        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.entry_date}
                className={`p-5 rounded-lg border ${getMoodColor(entry.mood_score)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getMoodIcon(entry.mood_score)}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {format(new Date(entry.entry_date), 'MMMM dd, yyyy')}
                      </p>
                      {entry.mood_label && entry.mood_score && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          Mood: {entry.mood_label} ({entry.mood_score}/10)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No entries yet. Start journaling to track your mental wellness!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
