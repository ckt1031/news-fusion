import type { PropsWithChildren } from 'react';
import './globals.css';
import { Toaster } from '@/app/components/ui/toaster';
import {
	DEFAULT_SITE_DESCRIPTION,
	DEFAULT_SITE_TITLE,
	TWITTER_USER,
} from '@/config';
import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_SC, Noto_Sans_TC } from 'next/font/google';
import AuthStateInializer from './components/auth/client';
import Heading from './components/heading';
import { ThemeProvider } from './components/theme';
import VercelAnalytics from './components/vercel-analytics';
import { serverAuthState } from './hooks/auth';
import { cn } from './utils/cn';

const inter = Inter({
	variable: '--font-inter',
	display: 'swap',
	subsets: ['latin'],
});
const notoSansSC = Noto_Sans_SC({
	variable: '--font-noto-sans-sc',
	subsets: ['latin'],
});
const notoSansTC = Noto_Sans_TC({
	variable: '--font-noto-sans-tc',
	subsets: ['latin'],
});

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	minimumScale: 1,
	maximumScale: 1,
};

export const metadata: Metadata = {
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

export default async function RootLayout({ children }: PropsWithChildren) {
	const { user, isLoggedIn } = await serverAuthState();

	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(inter.variable, notoSansSC.variable, notoSansTC.variable)}
		>
			<VercelAnalytics />
			<body className="subpixel-antialiased bg-neutral-50 dark:bg-neutral-950 flex h-screen flex-col justify-between overflow-x-hidden">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Toaster />
					<Heading />
					<AuthStateInializer isLoggedIn={isLoggedIn} user={user}>
						<main className="root-container flex flex-1 flex-col">
							{children}
						</main>
					</AuthStateInializer>
				</ThemeProvider>
			</body>
		</html>
	);
}
