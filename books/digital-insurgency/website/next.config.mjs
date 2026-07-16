/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloud Run: standalone server output (matches publishing/app pattern).
  output: "standalone",
};
export default nextConfig;
