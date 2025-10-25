import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/types';

export default async function createJob(
  supabase: SupabaseClient<Database>,
  type: string,
  step: string = 'idle'
) {
  const { data: jobData, error } = await supabase
    .from('jobs')
    .insert({
      updated_at: new Date().toISOString(),
      type: type,
      step: step,
    })
    .select()
    .single();
  if (error || !jobData) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Failed to create job: ' + (error?.message || 'No data returned'),
    });
  }
  return jobData;
}
