import webpack from "webpack"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  webpack(config) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    }

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.FLUENTFFMPEG_COV": false,
      })
    )

    return config
  },
}

export default nextConfig
