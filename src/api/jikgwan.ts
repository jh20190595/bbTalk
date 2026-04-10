import { supabase } from '@/lib/supabase'

export async function createJikgwanRecord(
  userId: string,
  dateStr: string,
  file: File,
): Promise<void> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${dateStr}_${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('jikgwan')
    .upload(path, file)
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('jikgwan').getPublicUrl(path)

  const { error } = await supabase.from('jikgwan_records').insert({
    user_id: userId,
    game_date: dateStr,
    photo_url: publicUrl,
  })
  if (error) throw error
}
