import { supabase } from '../lib/supabase'

interface Category {
  name: string;
  description?: string;
  user_id: string;
}

export const addCategory = async (category: Category) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
