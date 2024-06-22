import Auth from '@/app/components/auth';
import LoginPageComponent from './login-component';

export default async function Login() {
	return (
		<Auth reversed>
			<LoginPageComponent />
		</Auth>
	);
}

export const runtime = 'edge';
