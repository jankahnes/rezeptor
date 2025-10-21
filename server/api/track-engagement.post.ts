import { Database } from "~/types/supabase";
import { serverSupabaseServiceRole } from "#supabase/server";

// server/api/track-engagement.post.ts
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { events } = body; // Array of { recipeId, type }
    
    if (!Array.isArray(events) || events.length === 0) {
      return { success: false, error: 'Invalid events' };
    }
  
    const supabase = serverSupabaseServiceRole<Database>(event);
    
    const pointsMap: Record<string, number> = {
      click: 10,
      time_spent: 10,
      copy: 25,
      shopping_list: 50,
      share: 80,
    };
  
    for (const { recipeId, type } of events) {
      const points = pointsMap[type];
      if (!points || !recipeId) continue;
      
      await supabase.rpc('increment_recipe_engagement', {
        recipe_id_param: recipeId,
        points_param: points,
      });
    }
  
    return { success: true, processed: events.length };
  });