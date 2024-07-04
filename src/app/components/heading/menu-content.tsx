import { BookOpenText, Bookmark, LogIn, ScanEye } from 'lucide-react';

import {
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import { useAuthStore } from '@/app/store/auth';
import getSHA256 from '@/app/utils/sha256';
import Image from 'next/image';
import Link from 'next/link';
import { LogOutMenuItem } from './logout';
import { ModeToggleMenuItem } from './mode-toggle';

export function getGravatarUrl(email: string, size?: number) {
	const SHA256 = getSHA256(email);
	return `https://www.gravatar.com/avatar/${SHA256}?s=${size ?? 100}`;
}

export default function MenuContent() {
	const { isLoggedIn, user } = useAuthStore();
	const avatarUrl = user?.email ? getGravatarUrl(user.email) : null;

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
							{avatarUrl && (
								<Image
									src={avatarUrl}
									alt="avatar"
									className="rounded-full mr-2"
									width={16}
									height={16}
								/>
							)}
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
