import type { NextConfig } from 'next';

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
		],
	},
	transpilePackages: ['lucide-react', '@ckt1031/*'],
	experimental: {
		ppr: true,
		reactCompiler: isProd,
	},
};

export default nextConfig;
