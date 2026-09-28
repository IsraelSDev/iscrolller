'use server';

import { cookies, headers } from 'next/headers';
import { FEEDBACK_RATINGS, MAX_FEEDBACK_LENGTH, allowFeedback, appendFeedback, emailFeedback } from '@/lib/feedback';
import { NSFW_COOKIE, isNsfwEnabled, readNsfwPreference } from '@/lib/nsfw';

export type FeedbackState = { status: 'idle' | 'ok' | 'error'; message?: string };

export async function sendFeedback(_prev: FeedbackState, form: FormData): Promise<FeedbackState> {
  const rating = Number(form.get('rating'));
  const message = String(form.get('message') ?? '').trim();
  const page = String(form.get('page') ?? '/').slice(0, 200);

  if (!FEEDBACK_RATINGS.includes(rating as (typeof FEEDBACK_RATINGS)[number])) {
    return { status: 'error', message: 'Please pick a rating.' };
  }
  if (message.length > MAX_FEEDBACK_LENGTH) {
    return { status: 'error', message: `Maximum ${MAX_FEEDBACK_LENGTH} characters.` };
  }

  // IP usado só para limitar abuso; não é armazenado.
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'local';
  if (!allowFeedback(ip)) {
    return { status: 'error', message: 'Too many submissions. Try again in a few minutes.' };
  }

  const entry = {
    at: new Date().toISOString(),
    rating,
    message,
    nsfw: await readNsfwPreference(),
    page: page.startsWith('/') ? page : '/',
  };

  // Email e arquivo são independentes: basta um dar certo para o feedback não se perder.
  const [emailed, saved] = await Promise.allSettled([emailFeedback(entry), appendFeedback(entry)]);
  if (emailed.status === 'rejected') console.error('[feedback] email falhou:', emailed.reason);
  if (saved.status === 'rejected') console.error('[feedback] arquivo falhou:', saved.reason);

  const delivered = (emailed.status === 'fulfilled' && emailed.value) || saved.status === 'fulfilled';
  return delivered ? { status: 'ok' } : { status: 'error', message: 'Could not send right now.' };
}

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
