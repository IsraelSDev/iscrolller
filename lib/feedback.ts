// Persistência de feedback em JSONL local (uma linha por envio).
// Funciona em servidor próprio/Docker com disco persistente. Em serverless (ex.: Vercel)
// o disco é efêmero: troque appendFeedback por um banco/serviço.
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const FEEDBACK_RATINGS = [1, 2, 3, 4, 5] as const;
export const MAX_FEEDBACK_LENGTH = 1000;

const FILE = process.env.FEEDBACK_FILE || path.join(process.cwd(), 'data', 'feedback.jsonl');

export type FeedbackEntry = {
  at: string;
  rating: number;
  message: string;
  nsfw: boolean;
  page: string;
};

export async function appendFeedback(entry: FeedbackEntry) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, `${JSON.stringify(entry)}\n`, 'utf8');
}

// Envio por email via Resend (https://resend.com/docs/api-reference/emails/send-email).
// Opcional: sem RESEND_API_KEY/FEEDBACK_EMAIL_TO, só grava no arquivo.
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function emailFeedback(entry: FeedbackEntry) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_EMAIL_TO;
  if (!apiKey || !to) return false;

  const stars = '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.FEEDBACK_EMAIL_FROM || 'iscrolller <onboarding@resend.dev>',
      to: [to],
      subject: `[iscrolller] Feedback ${entry.rating}/5`,
      text: `Rating: ${stars} (${entry.rating}/5)\nPage: ${entry.page}\nNSFW: ${entry.nsfw}\nAt: ${entry.at}\n\n${entry.message || '(no message)'}`,
      html: `<p><b>Rating:</b> ${stars} (${entry.rating}/5)<br><b>Page:</b> ${escapeHtml(entry.page)}<br><b>NSFW:</b> ${entry.nsfw}<br><b>At:</b> ${entry.at}</p><p style="white-space:pre-wrap">${escapeHtml(entry.message) || '<i>(no message)</i>'}</p>`,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend HTTP ${res.status}`);
  return true;
}

// Limite simples em memória: 5 envios por IP a cada 10 min.
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

export function allowFeedback(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.delete(hits.keys().next().value!);
  return true;
}
