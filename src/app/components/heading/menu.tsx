import { EllipsisVertical, LogIn } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { authState } from '@/app/hooks/auth';
import getSHA256 from '@/app/utils/sha256';
import LogOutMenuItem from './logout';
import { ModeToggleMenuItem } from './mode-toggle';

async function getGavatarUrl(email: string) {
	const SHA256 = getSHA256(email);
	return `https://www.gravatar.com/avatar/${SHA256}?d=identicon`;
}

export async function HeaderMenu() {
	const { isLoggedIn, user } = await authState();
	const avatarUrl = user?.email ? await getGavatarUrl(user.email) : null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<EllipsisVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[170px] lg:w-[200px]">
				<DropdownMenuLabel>My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{isLoggedIn ? (
					<>
						<DropdownMenuItem>
							{user?.email && (
								<img
									alt="Profile"
									// biome-ignore lint/style/noNonNullAssertion: <explanation>
									src={avatarUrl!}
									className="rounded-full h-4 w-4 mr-2"
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
