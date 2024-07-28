import DateSwitcher from '@/components/news/date-switcher';
import AIDisclaimer from '@/components/news/list/disclaimer';
import type { PropsWithChildren } from 'react';

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<>
			<DateSwitcher />
			{children}
			<div className="mb-5">
				<AIDisclaimer />
			</div>
		</>
	);
}
