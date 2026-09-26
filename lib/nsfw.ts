import { cookies } from 'next/headers';

export const NSFW_COOKIE = 'nsfw';

// Flag global (servidor). Padrão: habilitado. NSFW_ENABLED=false desliga tudo.
export function isNsfwEnabled() {
  return process.env.NSFW_ENABLED !== 'false';
}

// Preferência do usuário (cookie httpOnly) sempre subordinada à flag global.
export async function readNsfwPreference() {
  if (!isNsfwEnabled()) return false;
  return (await cookies()).get(NSFW_COOKIE)?.value === '1';
}
