// next-secure-headers
import { createSecureHeaders } from 'next-secure-headers';

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	reactStrictMode: true,
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				hostname: 'www.gravatar.com',
			},
			{
				hostname: 'www.google.com',
			},
		],
	},
	transpilePackages: ['lucide-react', '@ckt1031/*'],
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: createSecureHeaders(),
			},
		];
	},
};

export default nextConfig;
