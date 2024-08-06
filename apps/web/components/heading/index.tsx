'use client';

import { DEFAULT_SITE_TITLE } from '@ckt1031/config';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import HeaderMenu from './menu';

export default function Heading() {
	const { resolvedTheme } = useTheme();

	const headerImage =
		resolvedTheme === 'dark'
			? '/header/mobile-dark.png'
			: '/header/mobile-light.png';

	return (
		<header className="flex flex-row py-2 mt-1 md:mt-3 justify-between items-center root-container">
			<div>
				<Link href="/" className="flex items-center flex-row">
					<Image
						src={headerImage}
						alt="logo"
						width={250}
						height={250}
						className="h-[60px] w-[60px]"
					/>
					<p className="text-xl md:text-2xl lg:text-3xl font-semibold dark:text-white">
						{DEFAULT_SITE_TITLE}
					</p>
				</Link>
				<p className="text-gray-600 dark:text-gray-400 hidden lg:block">
					Hassle-free news reading experience
				</p>
			</div>
			<div>
				<HeaderMenu />
			</div>
		</header>
	);
}
