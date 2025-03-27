# densair

Your reading assistant - for Research Papers that intrigue you.

## Highlights

- Not able to get yourself to read a technically dense paper? It's now as easy as entering the ArXiv ID of the publication.
- Reduce the gulf of worry with the "Motivation" button, to discover what the paper really stands for, instead of dwelling in worry after listening to that gnarly jargon.
- Don't know what the jargon means? We've got that covered. Just click on one of the key terms, and it'll take you to curated resources meant to make the paper digestible.
- Don't want to read any of the summaries? You're still in luck. Chat with the assistant to only get information you want out of the paper.
- Unable to understand those octopus-like flowcharts and those charts and graphs? No worries. We also summarize the figures in the paper.

## Demo

![Demo](https://github.com/themohitnair/densair/blob/main/assets/demo.gif)

## External APIs used

1. [Exa Search API](https://exa.ai/)
2. [Upstash Vector API](upstash.com/docs/vector/overall/whatisvector)
3. [LlamaParse](https://docs.llamaindex.ai/en/stable/llama_cloud/llama_parse/)
4. [Gemini API](https://ai.google.dev/gemini-api/docs)
5. [Amazon Polly](https://aws.amazon.com/polly/)
6. [Together AI API](https://www.together.ai/)

## Hosting

The NextJS frontend is hosted on Vercel, and the FastAPI backend is hosted on Google Cloud Run

## Rate Limits

- PDF Processing for Summaries:
Processes a paper's PDF to extract summaries.
Rate Limit: 5 requests per minute.

- Audio Summary Generation:
Generates and returns an audio summary (MP3) of a paper for inline playback in the browser.
Rate Limit: 1 request per day.

- Term Augmentation:
Searches for and returns augmenters based on a search term and additional context.
Rate Limit: 50 requests per minute.

- Paper Processing for Vector Embedding:
Processes a paper by chunking and embedding its PDF for subsequent conversational queries.
Rate Limit: 2 requests per minute.

- Paper Querying:
Queries a processed paper using vector-based search to retrieve answers.
Rate Limit: 100 requests per minute.

These rate limits have been applied to ensure that the service remains available to all users and to reduce the credits incurred. If you encounter any issues, please wait for a few minutes before trying again.

Go try it out!

Here's the [site](https://densair.vercel.app).

Do star the repository if densAIr helps you read a paper.

Start making sense of research papers today!
