import type { User } from '@supabase/supabase-js';
import { fetchBookmarks } from './actions';
import BookmarkList from './list';

interface Props {
	user: User;
}

export default async function Bookmarks({ user }: Props) {
	const bookmarks = await fetchBookmarks(user);

	return <BookmarkList bookmarks={bookmarks} />;
}
