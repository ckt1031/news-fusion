import AvatarProfileSettings from './settings/avatar';
import DisplayName from './settings/display-name';
import Email from './settings/email';
import ProfileNavigation from './settings/navigation';

export default async function Page() {
	return (
		<div className="flex flex-col gap-3 my-3">
			<ProfileNavigation />
			<AvatarProfileSettings />
			<DisplayName />
			<Email />
		</div>
	);
}
