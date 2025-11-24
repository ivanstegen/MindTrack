import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HabitsClient } from './HabitsClient'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch habits and their history
  const { data: habits } = await supabase
    .from('habits')
    .select(`
      *,
      habit_history (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <HabitsClient initialHabits={habits || []} />
}
