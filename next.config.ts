import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Evita que o Turbopack suba até um package-lock.json fora do projeto.
  turbopack: { root: __dirname },
};

export default nextConfig;
