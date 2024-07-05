'use client';

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
					{user?.avatarURL && (
						<Image
							src={user.avatarURL}
							alt="avatar"
							width={100}
							height={100}
							className="rounded-full"
						/>
					)}
				</a>
			</CardContent>
		</Card>
	);
}
