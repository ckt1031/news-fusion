import type { Metadata } from 'next';
import AvatarProfileSettings from './settings/avatar';
import DisplayName from './settings/display-name';
import Email from './settings/email';
import ProfileNavigation from './settings/navigation';

export const runtime = 'edge';

const title = 'Account Profile';

export const metadata: Metadata = {
	title,
	openGraph: {
		title,
	},
	twitter: {
		title,
	},
};

export default function Page() {
	return (
		<div className="flex flex-col gap-3 my-3">
			<ProfileNavigation />
			<AvatarProfileSettings />
			<DisplayName />
			<Email />
		</div>
	);
}
