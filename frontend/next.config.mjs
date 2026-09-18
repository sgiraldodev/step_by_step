const nextConfig = {
  output: 'standalone',
  async rewrites() {
    const api = process.env.API_INTERNAL_URL || 'http://localhost:8000';
    return [
      { source: '/api/v1/:path*', destination: `${api}/api/v1/:path*` },
      { source: '/api/:path*', destination: `${api}/:path*` },
    ];
  },
};
export default nextConfig;
