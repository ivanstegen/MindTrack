'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'
import { format, startOfWeek, addDays } from 'date-fns'
import { Target, Plus, Trash2, Flame, Trophy, Check, X, Loader2 } from 'lucide-react'

interface HabitHistory {
  habit_id: string
  date: string
  completed: boolean
}

interface Habit {
  id: string
  name: string
  description: string | null
  streak: number
  best_streak: number
  created_at: string
  habit_history: HabitHistory[]
}

interface HabitsClientProps {
  initialHabits: Habit[]
}

export function HabitsClient({ initialHabits }: HabitsClientProps) {
  const { user } = useAuthStore()
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitDescription, setNewHabitDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName.trim() || !user) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: newHabitName,
          description: newHabitDescription || null,
          streak: 0,
          best_streak: 0,
        })
        .select()
        .single()

      if (error) throw error

      setHabits([{ ...data, habit_history: [] }, ...habits])
      setNewHabitName('')
      setNewHabitDescription('')
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to add habit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)

      if (error) throw error

      setHabits(habits.filter(h => h.id !== habitId))
    } catch (error) {
      console.error('Failed to delete habit:', error)
    }
  }

  const handleToggleCompletion = async (habitId: string, date: string) => {
    if (!user) return

    try {
      const supabase = createClient()
      const habit = habits.find(h => h.id === habitId)
      if (!habit) return

      const existingHistory = habit.habit_history.find(h => h.date === date)
      const newCompleted = !existingHistory?.completed

      // Upsert habit history
      const { error } = await supabase
        .from('habit_history')
        .upsert({
          habit_id: habitId,
          date,
          completed: newCompleted,
        })

      if (error) throw error

      // Calculate new streak
      let newStreak = habit.streak
      if (date === today) {
        if (newCompleted) {
          newStreak = habit.streak + 1
        } else {
          newStreak = 0
        }

        // Update habit streak
        const { error: updateError } = await supabase
          .from('habits')
          .update({
            streak: newStreak,
            best_streak: Math.max(newStreak, habit.best_streak),
          })
          .eq('id', habitId)

        if (updateError) throw updateError
      }

      // Update local state
      setHabits(habits.map(h => {
        if (h.id === habitId) {
          const updatedHistory = existingHistory
            ? h.habit_history.map(hist => 
                hist.date === date ? { ...hist, completed: newCompleted } : hist
              )
            : [...h.habit_history, { habit_id: habitId, date, completed: newCompleted }]

          return {
            ...h,
            streak: date === today ? newStreak : h.streak,
            best_streak: date === today ? Math.max(newStreak, h.best_streak) : h.best_streak,
            habit_history: updatedHistory,
          }
        }
        return h
      }))
    } catch (error) {
      console.error('Failed to toggle completion:', error)
    }
  }

  const isCompleted = (habit: Habit, date: string) => {
    return habit.habit_history.some(h => h.date === date && h.completed)
  }

  const getCompletionRate = (habit: Habit) => {
    const totalDays = habit.habit_history.length
    if (totalDays === 0) return 0
    const completedDays = habit.habit_history.filter(h => h.completed).length
    return Math.round((completedDays / totalDays) * 100)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Habits
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily habits and build positive routines
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Habit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Habits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{habits.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habits.length > 0 ? Math.max(...habits.map(h => h.best_streak)) : 0} days
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {habits.filter(h => isCompleted(h, today)).length}/{habits.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Habits List */}
      {habits.length > 0 ? (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {habit.streak} day streak
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Best: {habit.best_streak} days
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {getCompletionRate(habit)}% completion
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Week View */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const completed = isCompleted(habit, dateStr)
                  const isToday = dateStr === today
                  const isFuture = day > new Date()

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isFuture && handleToggleCompletion(habit.id, dateStr)}
                      disabled={isFuture}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${completed
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        }
                        ${isToday ? 'ring-2 ring-purple-500' : ''}
                        ${isFuture ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
                      `}
                    >
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {format(day, 'EEE')}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {format(day, 'dd')}
                        </p>
                        {completed ? (
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 mx-auto" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No habits yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start building positive routines by adding your first habit
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Your First Habit
          </button>
        </div>
      )}

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Habit
            </h2>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Name *
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Morning meditation"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  placeholder="Why is this habit important to you?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Habit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
