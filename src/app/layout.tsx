import type { PropsWithChildren } from 'react';
import './globals.css';
import { Toaster } from '@/app/components/ui/toaster';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC, Noto_Sans_TC } from 'next/font/google';
import { ThemeProvider } from './components/Theme';
import Heading from './components/heading';
import { cn } from './utils/cn';

export const metadata: Metadata = {
	title: 'AI News',
	description: 'Hassle-free news reading experience',
};

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

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(inter.variable, notoSansSC.variable, notoSansTC.variable)}
		>
			<body className="bg-neutral-50 dark:bg-neutral-950 flex h-screen flex-col justify-between overflow-x-hidden">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Toaster />
					<Heading />
					<main className="root-container flex flex-1 flex-col">
						{children}
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
