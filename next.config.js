/** @type {import('next').NextConfig} */
const backendOrigin = (
  process.env.API_ORIGIN ||
  process.env.BACKEND_URL ||
  "http://localhost:9000"
).replace(/\/+$/, "");

const nextConfig = {
  reactStrictMode: true,
  // Output standalone para Docker (gera servidor Node.js otimizado)
  output: 'standalone',
  // Garante que @react-pdf/renderer seja empacotado em vez de externalizado,
  // evitando erros do Turbopack com ESM externo.
  transpilePackages: ['@react-pdf/renderer'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'video-gsproducao.s3.sa-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  turbopack: {},
  // Configuracao aplicada apenas ao pipeline Webpack legado
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
