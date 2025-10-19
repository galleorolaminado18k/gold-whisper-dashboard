/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Exportación estática para GitHub Pages
  output: 'export',
  
  // Deshabilitar características no soportadas en static export
  trailingSlash: true,
}

export default nextConfig
