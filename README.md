# densair

Your reading assistant for Research Papers that intimidate and intrigue you.

## Motivation

Been procrastinating reading a paper because it looks very intimidating? Not able to even open the paper because your heart starts thumping at the sight of all that jargon? No worries. Densair is here.

Here's what densAIr allows you to do with ArXiv papers:

1. Generate summaries about the overall paper, and specific parts - like those gnarly tables and diagrams, and those sections starting with big words (Methodology, Abstract and Conclusion).
2. Enhance in-depth understanding with key terms required to comprehend the paper with curated resources.
3. Chat with the paper with the power of Retrieval Augmented Generation (RAG).

Go try it out!

Here's the [site](https://densair.vercel.app).

Do star the repository if densAIr helps you read a paper.

Start making sense of research papers today!

## Demo

![Demo](/home/themohitnair/Videos/Screencasts/demo.gif)

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

* PDF Processing for Summaries:
Processes a paper's PDF to extract summaries.
Rate Limit: 5 requests per minute.

* Audio Summary Generation:
Generates and returns an audio summary (MP3) of a paper for inline playback in the browser.
Rate Limit: 1 request per day.

* Term Augmentation:
Searches for and returns augmenters based on a search term and additional context.
Rate Limit: 50 requests per minute.

* Paper Processing for Vector Embedding:
Processes a paper by chunking and embedding its PDF for subsequent conversational queries.
Rate Limit: 2 requests per minute.

* Paper Querying:
Queries a processed paper using vector-based search to retrieve answers.
Rate Limit: 100 requests per minute.

* Conversation Deletion:
Deletes the vectors associated with a conversation.
Rate Limit: No explicit rate limit applied.

These rate limits have been applied to ensure that the service remains available to all users and to reduce the credits incurred. If you encounter any issues, please wait for a few minutes before trying again.
