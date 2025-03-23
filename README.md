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

Here's a demo for new users (click on it to be redirected to a YouTube demo):

[![Watch the Demo](https://img.youtube.com/vi/q9tf5TN9OnQ/0.jpg)](https://www.youtube.com/watch?v=q9tf5TN9OnQ)

## External APIs used

1. Exa Search API - for searching and retrieving resources for Key Term augmenters
2. Upstash Vector API - for temporary storage of vector embeddings for RAG chat.
3. Llama Index Parse API - for converting the PDF to LLM-ready markdown for chunking and RAG.
4. Gemini API - For extensive summaries (overall, sectionwise, and figure/table summaries along with the audio summary)
5. ElevenLabs API - For generating the audio summary of the paper using the Gemini (spoken-style text) summarization.
6. Together AI API - To generate embeddings for RAG and to chat with the paper.

## Notable mentions

1. Docling by IBM [not used in final production deployment] - used earlier for accuracy and versatility; opted out because of RAM constraints.
2. Chonkie - Used Recursive Chunker without confusing interfaces from LangChain or LlamaIndex.
3. FastAPI - For the backend API.
4. SlowAPI - For the rate limiting.
5. Next.js - For the frontend.
6. Vercel - For hosting the frontend.
7. Google Cloud - For hosting the backend.

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
