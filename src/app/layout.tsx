import type { PropsWithChildren } from 'react';
import '@/styles/globals.css';
import AuthStateInializer from '@/components/auth/client';
import Heading from '@/components/heading';
import { Toaster } from '@/components/ui/toaster';
import {
	DEFAULT_SITE_DESCRIPTION,
	DEFAULT_SITE_TITLE,
	TWITTER_USER,
} from '@/config';
import { GeistMono } from 'geist/font/mono';
import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { Inter, Noto_Sans_SC, Noto_Sans_TC } from 'next/font/google';
import { ThemeProvider } from './theme-provider';
import { cn } from './utils/cn';
import { nextServerEnv } from './utils/env/server';

const inter = Inter({
	variable: '--font-inter',
	display: 'swap',
	subsets: ['latin'],
});
const notoSansSC = Noto_Sans_SC({
	variable: '--font-noto-sans-sc',
	display: 'swap',
	subsets: ['latin'],
});
const notoSansTC = Noto_Sans_TC({
	variable: '--font-noto-sans-tc',
	display: 'swap',
	subsets: ['latin'],
});

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
	maximumScale: 1,
};

export const metadata: Metadata = {
	metadataBase: new URL(nextServerEnv.SITE_URL),
	title: DEFAULT_SITE_TITLE,
	description: DEFAULT_SITE_DESCRIPTION,
	openGraph: {
		title: DEFAULT_SITE_TITLE,
		description: DEFAULT_SITE_DESCRIPTION,
	},
	twitter: {
		title: DEFAULT_SITE_TITLE,
		description: DEFAULT_SITE_DESCRIPTION,
		creator: TWITTER_USER,
	},
};

export const runtime = 'nodejs';

const VercelAnalytics = dynamic(() => import('./vercel-analytics'));

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				inter.variable,
				GeistMono.variable,
				notoSansSC.variable,
				notoSansTC.variable,
			)}
		>
			{nextServerEnv.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true' && (
				<VercelAnalytics />
			)}
			<body className="subpixel-antialiased bg-neutral-50 dark:bg-neutral-950 flex h-screen flex-col justify-between overflow-x-hidden">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Toaster />
					<Heading />
					<AuthStateInializer>
						<main className="root-container flex flex-1 flex-col">
							{children}
						</main>
					</AuthStateInializer>
				</ThemeProvider>
			</body>
		</html>
	);
}
