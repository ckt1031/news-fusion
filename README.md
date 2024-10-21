# News Fusion

A simple news aggregator that fetches news from multiple sources and displays them as RSS feed.

You can view the news by adding the feed into any RSS reader.

## Notes

Thsi project has been upgraded from both Python and JavaScript versions to a single Golang version for better performance and scalability.

## Features

- Automatically fetch news from multiple sources
- AI generated title and summary
- RSS feed for easy viewing, compatible with any RSS reader
- Duplicate detection to reduce the noise thanks to vector database

## Deployment

### Docker Compose

```bash
docker-compose up -d
```

### Standalone

Make sure you have Docker and Python installed.

Run fundamental services (Postgres and Qdrant) before running the News Fusion service:

```bash
# Postgres
docker run -d --name news-fusion-postgres -p 5432:5432 \
    -e POSTGRES_USER=postgres \ 
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=news_fusion \
    postgres:alpine
# Qdrant
docker run -d --name news-fusion-qdrant -p 6333:6333 -p 6334:6334 \
    -v $(pwd)/qdrant_storage:/qdrant/storage:z \
    qdrant/qdrant
```

Edit the env files, input your OpenAI API key.

```bash
cp .example.env .env
nano .env
```

Run the service:

```bash
pip install -r requirements.txt
python server.py & python scraper.py
```

## Showcase

Here is the example of the RSS feed in the NetNewsWire app:

![Screenshot](https://i.imgur.com/V8iLZLV.png)

With AI generated title and summary in the feed items to reduce the noise.

## FAQ

### Why do we need this?

RSS feed is good, but if you have subscribed to massive sources with same topics, it will be overwhelming with
duplicates.

Moreover, the provided articles can be un-important or not interesting to person.

This project aims to reduce the noise and provide the most important news to the user.

### Why we only offer RSS feed instead of making a web interface?

RSS feed is compatible with any RSS reader, and it is easy to integrate with other services.

Developing a web interface is not the main goal of this project, it can be complicated and time-consuming.

### How do you generate the title and summary?

We use OpenAI API (or Gemini API) to generate the title and summary of the article.

### How do we find out the duplicate articles?

We use Qdrant and OpenAI Embedding Models to calculate the similarity between the articles, if the similarity is higher
than a threshold, we consider them as duplicates.
