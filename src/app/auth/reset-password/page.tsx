import type { Metadata } from 'next';
import ResetPassword from './component';

export const runtime = 'edge';

const title = 'Reset Password';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
};

export default function ResetPasswordPage() {
	return <ResetPassword />;
}
