package lib

import (
	"context"
	"fmt"
	"os"

	"github.com/openai/openai-go"
	"github.com/qdrant/go-client/qdrant"
)

// Qdrant client
var QdrantClient *qdrant.Client
var QdrantContext = context.Background()

const QDRANT_CONNECTION_NAME = "articles"

func InitQdrantClient() {
	host := os.Getenv("QDRANT_HOST")

	if host == "" {
		host = "localhost"
	}

	client, err := qdrant.NewClient(&qdrant.Config{
		Host: host,
		Port: 6334,
	})

	if err != nil {
		panic(err)
	}

	yes, err := client.CollectionExists(QdrantContext, QDRANT_CONNECTION_NAME)

	if err != nil || !yes {
		// Create collection if it doesn't exist
		err = client.CreateCollection(QdrantContext, &qdrant.CreateCollection{
			CollectionName: QDRANT_CONNECTION_NAME,
			VectorsConfig: qdrant.NewVectorsConfig(&qdrant.VectorParams{
				Size:     1536,
				Distance: qdrant.Distance_Cosine,
			}),
		})

		if err != nil {
			panic(err)
		}

		fmt.Println("Collection created")
	}

	QdrantClient = client
}

func EmbeddingToFloat32(embedding []openai.Embedding) []float32 {
	var features32 []float32

	for _, f := range embedding {
		for _, item := range f.Embedding {
			features32 = append(features32, float32(item))
		}
	}

	return features32
}

func InsertArticle(embeddings []openai.Embedding, text string) error {
	points := []*qdrant.PointStruct{
		{
			Id:      qdrant.NewIDNum(0),
			Vectors: qdrant.NewVectors(EmbeddingToFloat32(embeddings)...),
		},
	}

	_, err := QdrantClient.Upsert(QdrantContext, &qdrant.UpsertPoints{
		CollectionName: QDRANT_CONNECTION_NAME,
		Points:         points,
	})

	return err
}

func QueryArticle(embeddings []openai.Embedding) ([]*qdrant.ScoredPoint, error) {
	e := EmbeddingToFloat32(embeddings)

	searchResult, err := QdrantClient.Query(QdrantContext, &qdrant.QueryPoints{
		CollectionName: QDRANT_CONNECTION_NAME,
		Query:          qdrant.NewQuery(e...),
	})

	return searchResult, err
}

func QueryArticleAndCheck(embeddings []openai.Embedding) (bool, error) {
	searchResult, err := QueryArticle(embeddings)

	if err != nil {
		return false, err
	}

	if len(searchResult) == 0 {
		return false, nil
	}

	hasScoreAboveThreshold := false
	threshold := float32(0.75)

	for _, result := range searchResult {
		if result.Score > threshold {
			hasScoreAboveThreshold = true
			break
		}
	}

	return hasScoreAboveThreshold, nil
}
