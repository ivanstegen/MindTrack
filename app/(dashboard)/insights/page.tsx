import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InsightsClient } from './InsightsClient'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all data for insights
  const [journalEntries, habits] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false }),
    supabase
      .from('habits')
      .select(`
        *,
        habit_history (*)
      `)
      .eq('user_id', user.id),
  ])

  return (
    <InsightsClient
      journalEntries={journalEntries.data || []}
      habits={habits.data || []}
    />
  )
}
