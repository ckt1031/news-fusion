import nextRoutes from 'nextjs-routes/config';

const withRoutes = nextRoutes({
	outDir: 'src',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
	},
};

export default withRoutes(nextConfig);
