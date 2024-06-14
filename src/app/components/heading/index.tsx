import { HeaderMenu } from './menu';

export default function Heading() {
	return (
		<header className="flex flex-row py-2 mt-1 md:mt-3 justify-between items-center root-container">
			<div className="">
				<a className="text-3xl font-semibold dark:text-white" href="/">
					AI News
				</a>
				<p className="text-gray-600 dark:text-gray-400">
					Hassle-free news reading experience
				</p>
			</div>
			<div>
				<HeaderMenu />
			</div>
		</header>
	);
}
