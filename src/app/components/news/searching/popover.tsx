// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/app/components/ui/popover"
import { Input } from '@/app/components/ui/input';
import { useNewsStore } from '@/app/store/news';
// import { useState } from "react";
import Fuse, { type IFuseOptions } from 'fuse.js';

export default function NewsSearchingPopoverContent() {
	// const [useAI, setUseAI] = useState(false);

	const baseNews = useNewsStore((state) => state.news);

	const setDisplayingNews = useNewsStore((state) => state.setDisplayingNews);

	const query = useNewsStore((state) => state.pageData.search);
	const setSearching = useNewsStore((state) => state.setSearching);

	const onFuzzyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;

		setSearching(value);

		if (!value || value.length < 3) {
			setDisplayingNews(baseNews);
			return;
		}

		const options: IFuseOptions<(typeof baseNews)[0]> = {
			keys: ['guid', 'title', 'summary', 'url'],
			includeScore: true,
			threshold: 0.3,
		};

		const fuse = new Fuse(baseNews, options);

		const results = fuse.search(value);
		const items = results.map((result) => result.item);

		console.log(items);
		setDisplayingNews(items);
	};

	return (
		<Input
			placeholder="Search something..."
			onChange={onFuzzyInputChange}
			value={query}
		/>
	);
}
