import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch dashboard data
  const [journalEntries, habits, challenges] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(30),
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ])

  return (
    <DashboardClient
      journalEntries={journalEntries.data || []}
      habits={habits.data || []}
      challenges={challenges.data || []}
    />
  )
}
