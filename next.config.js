import nextRoutes from 'nextjs-routes/config';
// import nextBundleAnalyzer from '@next/bundle-analyzer';

const withRoutes = nextRoutes({
	outDir: 'src',
});

const isProd = process.env.NODE_ENV === 'production';

// const withBundleAnalyzer = nextBundleAnalyzer({
//   enabled: !isProd,
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: isProd,
	transpilePackages: ['geist'],
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	// experimental: {
	// 	reactCompiler: isProd,
	// },
	images: {
		domains: ['www.gravatar.com'],
	},
};

export default withRoutes(nextConfig);
