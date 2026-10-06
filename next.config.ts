import type { NextConfig } from "next";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  turbopack: {
    root: __dirname,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
        pathname: "/**",
      },
    ],
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      cesium: path.resolve(__dirname, "node_modules/cesium"),
    };

    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(
              __dirname,
              "node_modules/cesium/Build/Cesium/Workers"
            ),
            to: path.join(
              __dirname,
              "public/cesium/Workers"
            ),
            noErrorOnMissing: true,
          },
          {
            from: path.join(
              __dirname,
              "node_modules/cesium/Build/Cesium/ThirdParty"
            ),
            to: path.join(
              __dirname,
              "public/cesium/ThirdParty"
            ),
            noErrorOnMissing: true,
          },
          {
            from: path.join(
              __dirname,
              "node_modules/cesium/Build/Cesium/Assets"
            ),
            to: path.join(
              __dirname,
              "public/cesium/Assets"
            ),
            noErrorOnMissing: true,
          },
          {
            from: path.join(
              __dirname,
              "node_modules/cesium/Build/Cesium/Widgets"
            ),
            to: path.join(
              __dirname,
              "public/cesium/Widgets"
            ),
            noErrorOnMissing: true,
          },
        ],
      })
    );

    return config;
  },
};

export default nextConfig;