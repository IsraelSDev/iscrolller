import type { Category } from './types';

// Filtros = temas mais pesquisados de cada lado (lista fixa e revisada).
// Adulto: gêneros populares em relatórios públicos de busca. Ficam de fora, de propósito,
// nomes de pessoas reais (risco de deepfake/conteúdo sem consentimento) e termos ligados
// a aparência de menoridade ou incesto.
export const CATEGORIES: Category[] = [
  { slug: 'wallpapers', name: 'Wallpapers', nsfw: false, query: 'wallpaper' },
  { slug: 'natureza', name: 'Natureza', nsfw: false, query: 'nature' },
  { slug: 'ceu', name: 'Céu', nsfw: false, query: 'sky' },
  { slug: 'praia', name: 'Praia', nsfw: false, query: 'beach' },
  { slug: 'por-do-sol', name: 'Pôr do sol', nsfw: false, query: 'sunset' },
  { slug: 'espaco', name: 'Espaço', nsfw: false, query: 'space galaxy' },
  { slug: 'carros', name: 'Carros', nsfw: false, query: 'cars' },
  { slug: 'cidade', name: 'Cidade', nsfw: false, query: 'city night' },
  { slug: 'flores', name: 'Flores', nsfw: false, query: 'flowers' },
  { slug: 'cachorros', name: 'Cachorros', nsfw: false, query: 'dogs' },
  { slug: 'gatos', name: 'Gatos', nsfw: false, query: 'cats' },
  { slug: 'comida', name: 'Comida', nsfw: false, query: 'food' },

  { slug: 'amador', name: 'Amador', nsfw: true, query: 'amateur' },
  { slug: 'milf', name: 'MILF', nsfw: true, query: 'milf' },
  { slug: 'lesbicas', name: 'Lésbicas', nsfw: true, query: 'lesbian' },
  { slug: 'latinas', name: 'Latinas', nsfw: true, query: 'latina' },
  { slug: 'asiaticas', name: 'Asiáticas', nsfw: true, query: 'asian' },
  { slug: 'loiras', name: 'Loiras', nsfw: true, query: 'blonde' },
  { slug: 'morenas', name: 'Morenas', nsfw: true, query: 'brunette' },
  { slug: 'ruivas', name: 'Ruivas', nsfw: true, query: 'redhead' },
  { slug: 'cosplay', name: 'Cosplay', nsfw: true, query: 'cosplay' },
  { slug: 'seios', name: 'Seios', nsfw: true, query: 'boobs' },
  { slug: 'bunda', name: 'Bunda', nsfw: true, query: 'ass' },
  { slug: 'casal', name: 'Casal', nsfw: true, query: 'couple' },
];

// NSFW ligado mostra SÓ conteúdo adulto; desligado, só SFW.
export const visibleCategories = (nsfw: boolean) => CATEGORIES.filter((c) => c.nsfw === nsfw);

export const findCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
