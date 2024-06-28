'use client';

import { Button } from '@/app/components/ui/button';
import { RSS_CATEGORY } from '@/config/news-sources';
import { useRouter } from 'next/navigation';
import { Combobox } from '../ui/combobox';

interface Props {
	topic: RSS_CATEGORY;
}

function captialFirstLetter(str: string) {
	// If length is 0 - 3, make it full uppercase
	if (str.length <= 3) {
		return str.toUpperCase();
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function TopicSelection({ topic }: Props) {
	const router = useRouter();

	const catagoies = Object.values(RSS_CATEGORY);

	console.log(
		catagoies.map((category) => ({
			value: category,
			label: captialFirstLetter(category),
		})),
	);

	return (
		<>
			<div className="flex w-full justify-center items-center py-2 md:hidden">
				<Combobox
					value={topic}
					setValue={(value) => router.push(`/topic/${value}`)}
					values={catagoies.map((category) => ({
						value: category,
						label: captialFirstLetter(category),
					}))}
					placeholder="Select a topic"
				/>
			</div>
			<div className="hidden md:block">
				<div className="flex flex-wrap py-2 gap-3">
					{catagoies.map((category) => (
						<Button
							key={category}
							variant={category === topic ? 'secondary' : 'outline'}
							className="py-0.5 px-3 rounded-lg"
							onClick={() => {
								const basePath =
									category === RSS_CATEGORY.GENERAL
										? '/'
										: `/topic/${category}`;

								router.push(`${basePath}${location.search}`);
							}}
						>
							{captialFirstLetter(category)}
						</Button>
					))}
				</div>
			</div>
		</>
	);
}
