'use server';

import { cookies } from 'next/headers';
import { NSFW_COOKIE, isNsfwEnabled } from '@/lib/nsfw';

export async function setNsfw(enabled: boolean) {
  const store = await cookies();

  if (enabled === true && isNsfwEnabled()) {
    store.set(NSFW_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  } else {
    store.delete(NSFW_COOKIE);
  }
}
