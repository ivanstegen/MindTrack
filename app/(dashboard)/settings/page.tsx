'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store/authStore'
import { Settings as SettingsIcon, User, Bell, Trash2, Loader2, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.')) {
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      // Delete user data (RLS will handle permissions)
      await Promise.all([
        supabase.from('journal_entries').delete().eq('user_id', user?.id),
        supabase.from('habits').delete().eq('user_id', user?.id),
        supabase.from('challenges').delete().eq('user_id', user?.id),
      ])

      // Sign out
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setLoading(false)
      setDeleteConfirm(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Account Information
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Appearance
          </h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors
                ${theme === 'light'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                }
              `}
            >
              <Sun className="w-5 h-5" />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors
                ${theme === 'dark'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                }
              `}
            >
              <Moon className="w-5 h-5" />
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors
                ${theme === 'system'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                }
              `}
            >
              <SettingsIcon className="w-5 h-5" />
              System
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Daily Reminders</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get reminded to journal daily</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Streak Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about habit streaks</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
            Danger Zone
          </h2>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-300">
            Once you delete your account, there is no going back. All your data including journal entries, habits, and insights will be permanently deleted.
          </p>
        </div>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="font-semibold text-gray-900 dark:text-white">
              Are you absolutely sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete My Account'
                )}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
