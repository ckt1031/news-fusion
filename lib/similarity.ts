import crypto from 'node:crypto';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import type { FeedItem } from './rss.js';

export default class Similarity {
	private readonly openai: OpenAI;
	private readonly collectionName = 'articles';
	private readonly qdrantClient: QdrantClient;

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

	async getEmbedding(content: string) {
		const response = await this.openai.embeddings.create({
			model: 'text-embedding-3-small',
			input: content,
		});

		return response.data[0].embedding;
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

	async saveArticle(articleData: FeedItem, embedding: number[]) {
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
