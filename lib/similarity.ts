import crypto from 'node:crypto';
import { TokenTextSplitter } from '@langchain/textsplitters';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import type { CreateEmbeddingResponse } from 'openai/resources';
import type { FeedItem } from './rss.js';

export default class Similarity {
	private readonly openai: OpenAI;

	readonly collectionName = 'articles';
	readonly qdrantClient: QdrantClient;

	constructor() {
		const requriedVariables = [
			'QDRANT_URL',
			'QDRANT_API_KEY',
			'OPENAI_API_KEY',
		];

		// Check if all required variables are set
		for (const variable of requriedVariables) {
			if (!process.env[variable]) {
				throw new Error(`Environment variable ${variable} is not set`);
			}
		}

		this.qdrantClient = new QdrantClient({
			url: process.env.QDRANT_URL,
			apiKey: process.env.QDRANT_API_KEY,
		});

		this.openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
			baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
		});
	}

	async initializeCollection() {
		// Check if the collection exists
		const collectionExists = await this.qdrantClient.collectionExists(
			this.collectionName,
		);

		if (!collectionExists.exists) {
			await this.qdrantClient.createCollection(this.collectionName, {
				vectors: {
					size: 1536,
					distance: 'Cosine',
				},
				hnsw_config: {
					m: 64,
					ef_construct: 512,
				},
				quantization_config: {
					scalar: {
						type: 'int8',
					},
				},
			});

			console.log(`Collection ${this.collectionName} created`);
		}
	}

	/**
	 * To prevent random errors or massive content length,
	 * we will set maximum content length to 12K tokens.
	 * Only send the first chunk to the embedding model, the rest will be abandoned.
	 */
	async handleMaxmiumContentLength(content: string) {
		const splitter = new TokenTextSplitter({
			chunkSize: 12 * 1000,
			chunkOverlap: 0,
			encodingName: 'o200k_base', // o200k_base is for newer models
		});

		const chunks = await splitter.splitText(content);

		return chunks[0];
	}

	async getEmbedding(content: string): Promise<number[][]> {
		const splitter = new TokenTextSplitter({
			chunkSize: 2000,
			chunkOverlap: 250,
			encodingName: 'o200k_base', // o200k_base is for newer models
		});

		const preProcessedContent = await this.handleMaxmiumContentLength(content);
		const chunks = await splitter.splitText(preProcessedContent);

		const response: CreateEmbeddingResponse =
			await this.openai.embeddings.create({
				model: 'text-embedding-3-small',
				input: chunks,
				encoding_format: 'float',
			});

		return response.data.map((chunk) => chunk.embedding);
	}

	async getSimilarArticles(content: string, limit = 5) {
		const embedding = await this.getEmbedding(content);

		const response = await this.qdrantClient.query(this.collectionName, {
			query: embedding,
			with_payload: false,
			with_vector: false,
			limit,
		});

		// Sort the points by score in descending order
		const points = response.points.sort((a, b) => b.score - a.score);

		const similarityThreshold = 0.75;

		const similarArticles = points.filter(
			(point) => point.score >= similarityThreshold,
		);

		return {
			similar: similarArticles.length > 0,
			similarities: similarArticles,
			embedding,
		};
	}

	async saveArticle(articleData: FeedItem, embedding: number[][]) {
		await this.qdrantClient.upsert(this.collectionName, {
			points: [
				{
					id: crypto.randomUUID(),
					vector: embedding,
					payload: {
						link: articleData.link,
						// RFC 3339 format
						createdAt: new Date(
							articleData.pubDate, // <-- ISO Date by default
						).toISOString(),
					},
				},
			],
		});
	}
}
