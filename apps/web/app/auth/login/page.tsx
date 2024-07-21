import Auth from '@/components/auth';
import type { Metadata } from 'next';
import LoginPageComponent from './login-component';

const title = 'Login';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
};

export default async function Login() {
	return (
		<Auth reversed>
			<LoginPageComponent />
		</Auth>
	);
}

export const runtime = 'edge';
