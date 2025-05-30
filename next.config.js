/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Picsum Photos (placeholder images)
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // UI Avatars (generated avatars)
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      // Unsplash (stock photos)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Placeholder.com
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      // Your own CDN or image hosting
      {
        protocol: 'https',
        hostname: 'your-cdn-domain.com',
      },
      // GitHub avatars (if using GitHub profile pics)
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      // Gravatar
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'aws4': 'aws4',
        'kerberos': 'kerberos',
        '@mongodb-js/zstd': '@mongodb-js/zstd',
        '@aws-sdk/credential-providers': '@aws-sdk/credential-providers',
      });
    }
    return config;
  },
}

module.exports = nextConfig
