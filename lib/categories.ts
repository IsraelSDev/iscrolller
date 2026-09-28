import type { Category } from './types';

// Filtros = temas mais pesquisados de cada lado (lista fixa e revisada).
// Adulto: gêneros populares em relatórios públicos de busca. Ficam de fora, de propósito,
// nomes de pessoas reais (risco de deepfake/conteúdo sem consentimento) e termos ligados
// a aparência de menoridade ou incesto.
export const CATEGORIES: Category[] = [
  { slug: 'wallpapers', name: 'Wallpapers', nsfw: false, query: 'wallpaper' },
  { slug: 'nature', name: 'Nature', nsfw: false, query: 'nature' },
  { slug: 'sky', name: 'Sky', nsfw: false, query: 'sky' },
  { slug: 'beach', name: 'Beach', nsfw: false, query: 'beach' },
  { slug: 'sunset', name: 'Sunset', nsfw: false, query: 'sunset' },
  { slug: 'space', name: 'Space', nsfw: false, query: 'space galaxy' },
  { slug: 'cars', name: 'Cars', nsfw: false, query: 'cars' },
  { slug: 'city', name: 'City', nsfw: false, query: 'city night' },
  { slug: 'flowers', name: 'Flowers', nsfw: false, query: 'flowers' },
  { slug: 'dogs', name: 'Dogs', nsfw: false, query: 'dogs' },
  { slug: 'cats', name: 'Cats', nsfw: false, query: 'cats' },
  { slug: 'food', name: 'Food', nsfw: false, query: 'food' },

  { slug: 'amateur', name: 'Amateur', nsfw: true, query: 'amateur' },
  { slug: 'milf', name: 'MILF', nsfw: true, query: 'milf' },
  { slug: 'lesbian', name: 'Lesbian', nsfw: true, query: 'lesbian' },
  { slug: 'latina', name: 'Latina', nsfw: true, query: 'latina' },
  { slug: 'asian', name: 'Asian', nsfw: true, query: 'asian' },
  { slug: 'blonde', name: 'Blonde', nsfw: true, query: 'blonde' },
  { slug: 'brunette', name: 'Brunette', nsfw: true, query: 'brunette' },
  { slug: 'redhead', name: 'Redhead', nsfw: true, query: 'redhead' },
  { slug: 'cosplay', name: 'Cosplay', nsfw: true, query: 'cosplay' },
  { slug: 'boobs', name: 'Boobs', nsfw: true, query: 'boobs' },
  { slug: 'ass', name: 'Ass', nsfw: true, query: 'ass' },
  { slug: 'couple', name: 'Couple', nsfw: true, query: 'couple' },
];

// NSFW ligado mostra SÓ conteúdo adulto; desligado, só SFW.
export const visibleCategories = (nsfw: boolean) => CATEGORIES.filter((c) => c.nsfw === nsfw);

export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
