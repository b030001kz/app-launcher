import { withPWA } from 'next-pwa'

const nextConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
})({
    /* config options here */
})

export default nextConfig
