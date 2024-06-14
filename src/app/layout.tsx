import type { PropsWithChildren } from 'react';
import './globals.css';
import { Toaster } from '@/app/components/ui/toaster';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './components/Theme';
import Heading from './components/heading';
import { cn } from './utils/cn';

export const metadata: Metadata = {
	title: 'AI News',
	description: 'Hassle-free news reading experience',
};

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

export default function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<body
					className={cn(
						'bg-neutral-50 dark:bg-neutral-950 flex h-screen flex-col justify-between overflow-x-hidden',
						inter.variable,
					)}
				>
					<Toaster />
					<Heading />
					<main className="root-container flex flex-1 flex-col">
						{children}
					</main>
				</body>
			</ThemeProvider>
		</html>
	);
}
