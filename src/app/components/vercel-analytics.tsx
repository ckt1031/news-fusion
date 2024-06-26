import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { nextEnv } from '../env';

export default function VercelAnalytics() {
	return (
		<>
			{nextEnv.ENABLE_VERCEL_ANALYTICS === '1' && (
				<>
					<Analytics />
					<SpeedInsights />
				</>
			)}
		</>
	);
}
