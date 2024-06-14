import { authState } from '@/app/hooks/auth';
import { redirect } from 'next/navigation';
import LoginPageComponent from './login-component';

export default async function Login() {
	const { isLoggedIn } = await authState();

	if (isLoggedIn) {
		return redirect('/');
	}

	return <LoginPageComponent />;
}
