import nextRoutes from 'nextjs-routes/config';

const withRoutes = nextRoutes({
	outDir: 'src',
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withRoutes(nextConfig);
