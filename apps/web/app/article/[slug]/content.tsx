import PublisherComponent from '@/components/news/list/publisher';
import dayjs from 'dayjs';
import { ExternalLink } from 'lucide-react';
import Markdown from 'react-markdown';
import type { getCachedArticle } from './fetch';

interface Props {
	data: NonNullable<Awaited<ReturnType<typeof getCachedArticle>>>;
}

export default function ArticlePageContent({ data }: Props) {
	return (
		<article className="mx-auto py-8">
			<header className="mb-5">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-300 mb-4">
					{data.title}
				</h1>
				<div className="flex items-center text-sm text-gray-700 dark:text-gray-400">
					{/* <span className="mr-4">{data.publisher}</span> */}
					<PublisherComponent
						publisher={data.publisher}
						url={data.url}
						className="mr-4"
					/>
					<time dateTime={data.publishedAt.toISOString()}>
						{dayjs(data.publishedAt).format('MMMM D, YYYY')}
					</time>
				</div>
			</header>

			<div className="prose prose-lg dark:prose-invert max-w-none">
				<h4>Summary:</h4>
				<Markdown className="text-xl text-gray-700 dark:text-gray-400 mb-8">
					{data.summary}
				</Markdown>
			</div>
			<a
				href={data.url}
				target="_blank"
				rel="noopener noreferrer"
				className="text-gray-700 dark:text-gray-500 flex items-center"
			>
				Full Article
				<ExternalLink className="h-4 w-4 ml-1" />
			</a>

			{/* {data.similarArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Similar Articles</h2>
          <ul className="space-y-4">
            {data.similarArticles.map((article, index) => (
              <li key={index} className="bg-gray-100 p-4 rounded-lg">
                <a href="#" className="text-blue-600 hover:underline">{article}</a>
              </li>
            ))}
          </ul>
        </section>
      )} */}

			<footer className="mt-12 pt-4 border-t-2 border-gray-200 dark:border-gray-700 text-sm text-gray-600">
				<p>GUID: {data.guid}</p>
			</footer>
		</article>
	);
}
