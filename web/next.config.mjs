/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pictograms are proxied through /api/pictograms/image so that the browser
  // never has to reach a third-party host directly (keeps CSP tight and lets
  // the Android client reuse the exact same URLs).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
