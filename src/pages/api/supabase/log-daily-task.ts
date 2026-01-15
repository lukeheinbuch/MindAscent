import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '../../../../lib/supabase/api'

type TaskLogPayload = {
  taskId: string
  xpGained: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload: TaskLogPayload = req.body

    if (!payload.taskId) {
      return res.status(400).json({ error: 'taskId is required' })
    }

    if (!payload.xpGained || payload.xpGained < 0) {
      return res.status(400).json({ error: 'xpGained must be a positive number' })
    }

    const supabase = createClient(req, res)

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if task is already completed today to prevent duplicate XP
    const { data: existingTask } = await supabase
      .from('daily_tasks')
      .select('id')
      .eq('user_id', user.id)
      .eq('task_id', payload.taskId)
      .eq('date', today)
      .single()

    if (existingTask) {
      // Task already completed today
      return res.status(200).json({ success: true, message: 'Task already completed today', isNewCompletion: false })
    }

    // Log the daily task completion
    const { data: taskLog, error: taskError } = await supabase
      .from('daily_tasks')
      .insert({
        user_id: user.id,
        task_id: payload.taskId,
        date: today,
        xp_gained: payload.xpGained,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (taskError) {
      return res.status(500).json({ error: `Failed to log daily task: ${taskError.message}` })
    }

    // Award XP - create ledger entry (idempotent check to prevent double rewards)
    const taskSourceId = `${user.id}_${payload.taskId}_${today}`

    const { data: existingXP } = await supabase
      .from('xp_ledger')
      .select('id')
      .eq('user_id', user.id)
      .eq('source', 'daily_task')
      .eq('source_id', taskSourceId)
      .single()

    if (!existingXP) {
      // Award XP to ledger
      const { data: xpEntry, error: xpError } = await supabase
        .from('xp_ledger')
        .insert({
          user_id: user.id,
          amount: payload.xpGained,
          source: 'daily_task',
          source_id: taskSourceId,
          description: `Completed daily task: ${payload.taskId}`,
        })
        .select()
        .single()

      if (xpError) {
        console.error('Failed to insert XP ledger entry:', xpError)
        // Don't fail the entire request, just log the error
      }

      // Recompute total XP from ledger (safer than read-modify-write)
      const { data: xpSum } = await supabase
        .from('xp_ledger')
        .select('amount')
        .eq('user_id', user.id)

      const totalXp = xpSum?.reduce((sum, entry) => sum + entry.amount, 0) || 0

      // Update profile with new total XP
      await supabase
        .from('profiles')
        .update({
          total_xp: totalXp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    res.status(200).json({ success: true, taskLog, isNewCompletion: true })
  } catch (error) {
    console.error('Daily task log error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
