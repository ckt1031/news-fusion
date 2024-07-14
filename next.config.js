// import nextBundleAnalyzer from '@next/bundle-analyzer';

// const isProd = process.env.NODE_ENV === 'production';

// const withBundleAnalyzer = nextBundleAnalyzer({
//   enabled: !isProd,
// });

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
	transpilePackages: ['lucide-react'],
	// experimental: {
	// 	ppr: true,
	// 	// reactCompiler: isProd,
	// },
	logging: {
		fetches: {
			fullUrl: true,
		},
	},
};

export default nextConfig;
