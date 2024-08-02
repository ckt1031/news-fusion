import DateSwitcher from '@/components/news/date-switcher';
import AIDisclaimer from '@/components/news/list/disclaimer';
import type { PropsWithChildren } from 'react';

import { currentDateString } from '@/components/news/get-date-server';

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<>
			<DateSwitcher currentDateString={currentDateString} />
			{children}
			<div className="mb-5">
				<AIDisclaimer />
			</div>
		</>
	);
}
