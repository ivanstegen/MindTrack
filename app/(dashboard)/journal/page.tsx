import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { JournalClient } from './JournalClient'

export default async function JournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch journal entries
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  return <JournalClient initialEntries={entries || []} />
}
