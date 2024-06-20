import { EllipsisVertical, LogIn, ScanEye } from 'lucide-react';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/app/components/ui/avatar';
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
import Link from 'next/link';
import LogOutMenuItem from './logout';
import { ModeToggleMenuItem } from './mode-toggle';

function getGavatarUrl(email: string) {
	const SHA256 = getSHA256(email);
	return `https://www.gravatar.com/avatar/${SHA256}?d=identicon`;
}

export async function HeaderMenu() {
	const { isLoggedIn, user } = await authState();
	const avatarUrl = user?.email ? getGavatarUrl(user.email) : null;

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
							<Avatar className="h-4 w-4 mr-2">
								<AvatarImage
									// biome-ignore lint/style/noNonNullAssertion: <explanation>
									src={avatarUrl!}
									alt="Profile"
								/>
								<AvatarFallback>User</AvatarFallback>
							</Avatar>
							<span>Profile</span>
						</DropdownMenuItem>
						<LogOutMenuItem />
					</>
				) : (
					<>
						<Link href="/auth/login">
							<DropdownMenuItem>
								<LogIn className="mr-2 h-4 w-4" />
								<span>Log In</span>
							</DropdownMenuItem>
						</Link>
					</>
				)}
				{isLoggedIn && (
					<>
						<DropdownMenuLabel>Tools</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<Link href="/tools/similarities">
							<DropdownMenuItem>
								<ScanEye className="mr-2 h-4 w-4" />
								<span>Similarities</span>
							</DropdownMenuItem>
						</Link>
					</>
				)}
				<ModeToggleMenuItem />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
