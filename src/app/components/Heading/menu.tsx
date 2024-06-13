import { EllipsisVertical, LogIn } from 'lucide-react';

import crypto from 'node:crypto';
import { Button } from '@/app/components/ui/button';
import { userState } from '@/app/hooks/auth';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import LogOutMenuItem from './logout';
import { ModeToggleMenuItem } from './ModeToggle';

async function getGavatarUrl(email: string) {
	const hash = crypto.createHash('sha256');
	hash.update(email);
	const SHA256 = hash.digest('hex');
	return `https://www.gravatar.com/avatar/${SHA256}?d=identicon`;
}

export async function HeaderMenu() {
	const { isLoggedIn, user } = await userState();
	const avatarUrl = user?.email ? await getGavatarUrl(user.email) : null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<EllipsisVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[170px] lg:w-[200px]">
				{isLoggedIn ? (
					<>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							{user?.email && (
								<img
									alt="Profile"
									// biome-ignore lint/style/noNonNullAssertion: <explanation>
									src={avatarUrl!}
									className="rounded-full h-6 w-6 mr-2"
								/>
							)}
							<span>Profile</span>
						</DropdownMenuItem>
						<LogOutMenuItem />
					</>
				) : (
					<>
						<a href="/auth/login">
							<DropdownMenuItem>
								<LogIn className="mr-2 h-4 w-4" />
								<span>Log In</span>
							</DropdownMenuItem>	
						</a>
					</>
				)}
				<ModeToggleMenuItem />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
