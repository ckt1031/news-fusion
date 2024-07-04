'use client';

import { getGravatarUrl } from '@/app/components/heading/menu-content';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/app/components/ui/card';
import { useAuthStore } from '@/app/store/auth';
import Image from 'next/image';

export default function AvatarProfileSettings() {
	const { user } = useAuthStore();
	const avatarUrl = user?.email ? getGravatarUrl(user.email, 800) : null;

	if (!avatarUrl) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Avatar</CardTitle>
				<CardDescription>
					Change your profile picture, we are using Gravatar, so you will be
					redirected to Gravatar website.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<a
					href="https://en.gravatar.com/emails"
					target="_blank"
					rel="noreferrer"
				>
					<Image
						src={avatarUrl}
						alt="avatar"
						width={100}
						height={100}
						className="rounded-full"
					/>
				</a>
			</CardContent>
		</Card>
	);
}
