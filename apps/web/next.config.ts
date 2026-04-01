import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // External packages that need to be transpiled
  transpilePackages: [],
  // Webpack config for crypto polyfills (needed by viem/wagmi)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

export default nextConfig
