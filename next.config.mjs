/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  // Khi deploy lên GitHub Pages repo tên là smartstudy: hailv04.github.io/smartstudy/
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || (isProd ? '/smartstudy' : ''),
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || (isProd ? '/smartstudy/' : ''),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['three'],
};

export default nextConfig;
