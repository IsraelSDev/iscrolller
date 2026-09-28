// Tipos compartilhados entre servidor e client (sem dependências).

export type Category = {
  slug: string;
  name: string;
  nsfw: boolean;
  query: string; // termo enviado aos provedores
};

export type MediaItem = {
  id: string;
  type: 'image' | 'video' | 'embed'; // embed = player em iframe (Eporner)
  title: string;
  credit: string;          // autor / fonte exibida no card
  link: string | null;     // página original no provedor (null = sem link)
  isAdult: boolean;
  width: number;
  height: number;
  thumb: string;           // imagem do grid
  full: string;            // imagem em HD (lightbox) ou poster do vídeo
  video: string | null;    // MP4 em HD (lightbox)
  preview: string | null;  // MP4 leve para preview no hover
  embed: string | null;
  duration: string | null;
};

export type ContentPage = { content: MediaItem[]; after: string | null };
