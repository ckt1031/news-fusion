import type { PropsWithChildren } from 'react';
import Auth from '../components/auth';

export default function ToolLayout({ children }: PropsWithChildren) {
	return <Auth>{children}</Auth>;
}
