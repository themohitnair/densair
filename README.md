# densair [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/themohitnair/densair)

Your Research Reading assistant - for Research Papers that intrigue you.
Visit us at [densAIr](https://densair.vercel.app/)

## Features

- **Summarization**: Summarize research papers in a concise, sectionwise manner. Also understand figures and tables in the paper.
- **Key Points**: Extract key terms from research papers, and obtain corresponding reading links on the topics.
- **Search**: Search for research papers semantically based on keywords or phrases. filter on the basis of topics and dates. (Uses [xivvy](https://github.com/themohitnair/xivvy))
- **Related Papers**: Find related research papers based on a given paper. (Uses [xivvy](https://github.com/themohitnair/xivvy))
- **Paper Metadata**: Get metadata information about a research paper, including title, authors, and more.
- **Chat with Paper**: Ask questions about the research paper and get answers based on its content. (Retrieval Augmented Generation).
- **Interest-oriented Feed**: Get a personalized feed of research papers based on your interests. (Uses [xivvy](https://github.com/themohitnair/xivvy))

## Stack

- NextJS (hosted on Vercel)
- FastAPI (hosted on Google Cloud Run)
- Turso with Drizzle (user database)
- Gemini 2.0 Flash Lite for summaries
- Groq Llama 3.3 70b Versatile for chat
- PyMuPDF4LLM for PDF parsing
- Upstash Vector, all-MiniLM-L12-v2 and Chonkie for RAG.

## Rate limits

densAIr started out as a hobby project, and is currently free to use. However, to ensure fair usage and prevent abuse, we have implemented rate limits on the API. In case a function does not work, please try again after a few minutes. We are working on improving the rate limits.

Thank you for your understanding!
