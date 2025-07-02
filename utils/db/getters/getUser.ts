import type { SupabaseClient } from '@supabase/supabase-js';
import { expectSingle } from '~/utils/db/getters/expectSingle';
import { getRecipesPartial } from '~/utils/db/getters/getRecipes';
import { getActivity } from '~/utils/db/getters/getActivity';
import { getImageUrl } from '~/utils/db/getters/getImageUrl';
import buildQuery from '~/utils/db/getters/buildQuery';
import type { GetterOpts } from '~/types/exports';

export async function getUsers(client: SupabaseClient, opts: GetterOpts = {}) {
  let query = client.from('profiles').select(`*`);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  const users = data as UserProcessed[];
  const ids = users.map((user) => user.id);
  const ownRecipes = await getRecipesPartial(client, { in: { user_id: ids } });
  const activity = await getActivity(client, {
    in: { user_id: ids },
    orderBy: { column: 'created_at', ascending: false },
  });
  const likes = await getRecipesPartial(client, { in: { user_id: ids } });
  const stats = {
    recipesCount: ownRecipes.length,
    activityCount: activity.length,
    likesCount: likes.length,
  };

  const processedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      recipes: ownRecipes.filter((recipe) => recipe.user_id === user.id),
      activity: activity.filter((item) => item.user_id === user.id),
      likes: likes.filter((recipe) => recipe.user_id === user.id),
      picture_url: await getImageUrl(client, 'profile', user.id, user.picture_ext),
      settings: user.settings as Record<string, any>,
      stats,
    }))
  );

  return processedUsers;
}

export async function getUsersPartial(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  let query = client.from('profiles').select(`*`);
  query = buildQuery(query, opts);
  const { data, error } = await query;
  if (error) throw error;
  const users = await Promise.all(
    data.map(async (user) => ({
      ...user,
      picture_url: await getImageUrl(client, 'profile', user.id, user.picture_ext),
    }))
  );
  return users as UserProcessed[];
}

export async function getUser(client: SupabaseClient, opts: GetterOpts = {}) {
  return expectSingle(await getUsers(client, opts));
}

export async function getUserPartial(
  client: SupabaseClient,
  opts: GetterOpts = {}
) {
  return expectSingle(await getUsersPartial(client, opts));
}
