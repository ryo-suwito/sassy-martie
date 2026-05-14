import { createClient } from '@/utils/supabase/server'

export type SystemConfigKey = 
  | 'grace_period_hours'
  | 'qa_schedule_cron'
  | 'taste_quorum_minimum'
  | 'taste_pass_threshold'
  | 'taste_vote_window_days'

/**
 * Fetches a configuration value from the system_config table.
 * Results are cached in a real-world scenario, but for now, we fetch directly.
 */
export async function getConfig(key: SystemConfigKey): Promise<string> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', key)
    .single()
    
  if (error || !data) {
    // Return a sensible default or throw if the key is mandatory
    console.warn(`System config key "${key}" not found.`)
    return ''
  }
  
  return data.value
}
