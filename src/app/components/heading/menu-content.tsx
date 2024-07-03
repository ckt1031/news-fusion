import { BookOpenText, Bookmark, LogIn, ScanEye } from 'lucide-react';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '@/app/components/ui/avatar';
import {
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { useAuthStore } from '@/app/store/auth';
import getSHA256 from '@/app/utils/sha256';
import Link from 'next/link';
import { LogOutMenuItem } from './logout';
import { ModeToggleMenuItem } from './mode-toggle';

function getGavatarUrl(email: string) {
	const SHA256 = getSHA256(email);
	return `https://www.gravatar.com/avatar/${SHA256}?d=identicon`;
}

export default function MenuContent() {
	const { isLoggedIn, user } = useAuthStore();
	const avatarUrl = user?.email ? getGavatarUrl(user.email) : null;

	return (
		<>
			<DropdownMenuLabel>My Account</DropdownMenuLabel>
			<DropdownMenuSeparator />
			{isLoggedIn ? (
				<>
					<Link
						href={{
							pathname: '/profile',
						}}
					>
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
					</Link>
					<Link
						href={{
							pathname: '/bookmarks',
						}}
					>
						<DropdownMenuItem>
							<Bookmark className="mr-2 h-4 w-4" />
							<span>Bookmarks</span>
						</DropdownMenuItem>
					</Link>
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
					<Link href="/tools/summarize">
						<DropdownMenuItem>
							<BookOpenText className="mr-2 h-4 w-4" />
							<span>Summarize</span>
						</DropdownMenuItem>
					</Link>
				</>
			)}
			<ModeToggleMenuItem />
		</>
	);
}
