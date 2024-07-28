import {
	ALL_RSS_CATEGORIES,
	type RSSChannelItem,
	RSS_CATEGORY,
} from '@ckt1031/config';
import { getChannelConfiguration } from '@ckt1031/news';

function getAllCatagorieNames() {
	const catagories = ALL_RSS_CATEGORIES.map((category) => {
		return category.name;
	});

	// Remove RSS_CATEGORY.VIDEOS
	const index = catagories.indexOf(RSS_CATEGORY.VIDEOS);

	if (index > -1) {
		catagories.splice(index, 1);
	}

	// Remove duplicates
	return [...new Set(catagories)];
}

type Category = {
	name: RSS_CATEGORY;
};

function getURL(channel: RSSChannelItem) {
	return typeof channel === 'string' ? channel : channel.url;
}

function URLListOfCategory({ name }: Category) {
	const category = ALL_RSS_CATEGORIES.find((category) => {
		return category.name === name;
	});

	if (!category) return null;

	return (
		<div key={name} className="mb-4">
			<h2 className="text-xl mb-2">{name.toLocaleUpperCase()}</h2>
			<table className="table-auto prose dark:prose-invert">
				<thead>
					<tr>
						<th className="px-4 py-2">Name</th>
						<th className="px-4 py-2">URL</th>
					</tr>
				</thead>
				<tbody>
					{category.channels.map((channel) => {
						const specificName = getChannelConfiguration(
							category,
							channel,
							'specificName',
							'',
						) as string;

						return (
							<tr key={getURL(channel)}>
								<td className="border px-4 py-2">
									{specificName.toLocaleUpperCase()}
								</td>
								<td className="border px-4 py-2">
									<a href={`/raw/${encodeURIComponent(getURL(channel))}`}>
										{getURL(channel)}
									</a>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export default function RawNewsList() {
	const catagories = getAllCatagorieNames();
	return (
		<>
			<h1 className="text-3xl mb-4">Raw RSS List</h1>
			{catagories.map((name) => {
				return <URLListOfCategory key={name} name={name} />;
			})}
		</>
	);
}
