import type { NextConfig } from 'next';
import { createSecureHeaders } from 'next-secure-headers';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
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
	experimental: {
		ppr: true,
		reactCompiler: isProd,

		typedRoutes: true,
		serverMinification: isProd,
		optimizeServerReact: isProd,

		forceSwcTransforms: true,

		...(isProd && {
			sri: {
				// This is the default value
				algorithm: 'sha384',
			},
		}),
	},
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
