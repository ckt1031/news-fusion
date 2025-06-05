import { TokenTextSplitter } from '@langchain/textsplitters';

const splitter = new TokenTextSplitter({
	chunkSize: 2000,
	chunkOverlap: 250,
	encodingName: 'cl100k_base',
});

const longText = `The quick brown fox jumps over the lazy dog.
A sudden gust of wind rustled the leaves. The old clock chimed precisely at midnight, echoing through the silent halls. Rivers flow endlessly to the sea, carving paths through ancient lands. Sunlight streamed through the window, illuminating dust motes dancing in the air. She carefully documented every detail, ensuring accuracy in her research. The bustling market was a symphony of sounds and colors. Mountains stood majestically, their peaks touching the clouds. A sense of calm settled over the quiet village as dusk approached. He pondered the mysteries of the universe, seeking answers within complex equations. The vibrant garden bloomed with an array of exotic flowers. Rain began to fall, pattering softly against the windowpane. The historic bridge spanned the deep canyon, connecting two distant shores. Children laughed joyfully as they played in the park. Innovation drives progress, constantly reshaping our world. The ancient ruins whispered tales of a forgotten civilization. Birds sang their morning chorus, welcoming the new day. Technology continues to evolve at an astonishing pace. The vast ocean held countless secrets beneath its surface. Books offer gateways to countless worlds and endless knowledge.`;

// Example of how to use the splitter
async function testSplitter() {
	const chunks = await splitter.splitText(longText);
	console.log('Generated Chunks:');
	chunks.forEach((chunk, index) => {
		console.log(`Chunk ${index + 1}: "${chunk}" (Length: ${chunk.length})`);
	});
	console.log('\nTotal Chunks:', chunks.length);
}

testSplitter();
