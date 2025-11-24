import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatClient } from './ChatClient'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch context for AI coach
  const [journalEntries, challenges] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(10),
    supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ])

  return (
    <ChatClient
      recentJournal={journalEntries.data || []}
      activeChallenges={challenges.data || []}
    />
  )
}
