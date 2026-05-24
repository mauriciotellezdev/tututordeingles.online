import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'en', // ❌ this overrides your html lang
  }
};

export default nextConfig;
