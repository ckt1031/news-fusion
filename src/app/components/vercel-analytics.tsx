import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { nextClientEnv } from '../utils/env/client';

export default function VercelAnalytics() {
	return (
		<>
			{nextClientEnv.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === 'true' && (
				<>
					<Analytics />
					<SpeedInsights />
				</>
			)}
		</>
	);
}
