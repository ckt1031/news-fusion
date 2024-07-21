/** @type {import('next').NextConfig} */
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
		],
	},
	transpilePackages: ['lucide-react', '@ckt1031/*'],
};

export default nextConfig;
