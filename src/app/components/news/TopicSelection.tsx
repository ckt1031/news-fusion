import { RSS_CATEGORY } from '@/config/news-sources';

interface Props {
	topic: RSS_CATEGORY;
}

function captialFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function TopicSelection({ topic }: Props) {
	return (
		<div className="flex flex-col">
			<div className="flex flex-wrap py-2">
				{Object.values(RSS_CATEGORY).map((category) => (
					<a
						key={category}
						className={`${
							category === topic
								? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800'
								: 'bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-white'
						} rounded-full py-0.5 px-3 mr-2 mb-2`}
						href={
							category === RSS_CATEGORY.GENERAL ? '/' : `/topic/${category}`
						}
					>
						{captialFirstLetter(category)}
					</a>
				))}
			</div>
		</div>
	);
}
