'use client';

import { Button } from '@/components/ui/button';
import captialTopicName from '@/utils/captial-topic-name';
import { RSS_CATEGORY } from '@ckt1031/config';
import { useRouter } from 'next/navigation';
import { Combobox } from '../ui/combobox';

interface Props {
	topic: RSS_CATEGORY;
}

export default function TopicSelection({ topic }: Props) {
	const router = useRouter();

	const catagoies = Object.values(RSS_CATEGORY);

	const onSelectCategory = (category: RSS_CATEGORY | string) => {
		const basePath =
			category === RSS_CATEGORY.GENERAL ? '/' : `/topic/${category}`;

		// @ts-ignore
		router.push(`${basePath}${location.search}`);
	};

	return (
		<>
			<div className="flex w-full justify-center items-center py-2 sm:hidden">
				<Combobox
					value={topic}
					setValue={onSelectCategory}
					values={catagoies.map((category) => ({
						value: category,
						label: captialTopicName(category),
					}))}
					placeholder="Select a topic"
				/>
			</div>
			<div className="hidden sm:block">
				<div className="flex flex-wrap py-2 gap-3">
					{catagoies.map((category) => (
						<Button
							key={category}
							variant={category === topic ? 'secondary' : 'outline'}
							className="py-0.5 px-3 rounded-lg"
							onClick={() => onSelectCategory(category)}
						>
							{captialTopicName(category)}
						</Button>
					))}
				</div>
			</div>
		</>
	);
}
