import DateSwitcher from '@/components/news/date-switcher';
import AIDisclaimer from '@/components/news/list/disclaimer';
import type { PropsWithChildren } from 'react';

import { currentDateString } from '@/utils/get-date-server';

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<>
			<DateSwitcher currentDateString={currentDateString} />
			{children}
			<div className="mt-4 mb-5">
				<AIDisclaimer />
			</div>
		</>
	);
}
