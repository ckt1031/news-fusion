import {
	BookOpenText,
	Bookmark,
	Ear,
	Info,
	LogIn,
	Rss,
	ScanEye,
} from 'lucide-react';

import { useAuthStore } from '@/components/store/auth';
import {
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';
import { LogOutMenuItem } from './logout';
import { ModeToggleMenuItem } from './mode-toggle';

export default function MenuContent() {
	const { isLoggedIn, user } = useAuthStore();

	return (
		<>
			<DropdownMenuLabel>My Account</DropdownMenuLabel>
			<DropdownMenuSeparator />
			{isLoggedIn ? (
				<>
					<Link href="/profile">
						<DropdownMenuItem>
							{user?.avatarURL && (
								<Image
									src={user.avatarURL}
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
					<Link href="/raw">
						<DropdownMenuItem>
							<Rss className="mr-2 h-4 w-4" />
							<span>Raw RSS Reader</span>
						</DropdownMenuItem>
					</Link>
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
					<Link href="/tools/importance">
						<DropdownMenuItem>
							<Ear className="mr-2 h-4 w-4" />
							<span>Check Importance</span>
						</DropdownMenuItem>
					</Link>
				</>
			)}
			<ModeToggleMenuItem />
			<DropdownMenuLabel>Information</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<Link href="/about">
				<DropdownMenuItem>
					<Info className="mr-2 h-4 w-4" />
					<span>About</span>
				</DropdownMenuItem>
			</Link>
		</>
	);
}
