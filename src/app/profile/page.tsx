import Auth from '../components/auth';
import DisplayName from './settings/display-name';
import Email from './settings/email';

export default function Page() {
	return (
		<Auth>
			<div className="flex flex-col gap-3 my-3">
				<DisplayName />
				<Email />
			</div>
		</Auth>
	);
}
