/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "i.ibb.co",
      "i.pinimg.com"
    ],
  },
}

module.exports = nextConfig
