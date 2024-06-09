import FindSimilarArtilesCommand from './find-similar';
import WebSearchCommand from './search';
import SummarizeCommand from './summarize';

const allCommands = [
	new SummarizeCommand(),
	new WebSearchCommand(),
	new FindSimilarArtilesCommand(),
];

export default allCommands;
