import type { PropsWithChildren } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Heading from './components/Heading';
import { ThemeProvider } from './components/Theme';
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
