import httpx
from typing import Optional, List
import logging.config

from models import SearchResult, ArxivDomains
from config import SEARCH_API, LOG_CONFIG

logging.config.dictConfig(LOG_CONFIG)


class Feed:
    def __init__(self, base_url: str = SEARCH_API):
        self.base_url = base_url
        self.client = None
        self.logger = logging.getLogger(__name__)

    async def __aenter__(self):
        self.client = httpx.AsyncClient(base_url=self.base_url)
        self.logger.debug("Initialized HTTP client.")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.client.aclose()
        self.logger.debug("Closed HTTP client.")

    async def search_papers_request(
        self,
        query: Optional[str] = None,
        categories: Optional[List[str]] = None,
        categories_match_all: bool = False,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        limit: int = 10,
    ) -> List[SearchResult]:
        params = {
            "query": query,
            "categories": categories,
            "categories_match_all": categories_match_all,
            "date_from": date_from,
            "date_to": date_to,
            "limit": limit,
        }
        self.logger.debug(f"Searching with params: {params}")
        try:
            response = await self.client.get("/search", params=params, timeout=httpx.Timeout(read=60.0))
            response.raise_for_status()
            return [SearchResult(**item) for item in response.json()]
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"HTTP status error: {e.response.status_code} - {e.response.text}"
            )
        except Exception as e:
            self.logger.exception(f"Unexpected error in search: {e}")
        return []

    async def _search_seed(
        self,
        query: Optional[str] = None,
        categories: Optional[List[ArxivDomains]] = None,
        categories_match_all: bool = False,
        limit: int = 10,
    ) -> List[SearchResult]:
        """Seed search using raw query and filters."""
        params = {
            "query": query,
            "categories_match_all": categories_match_all,
            "limit": limit,
        }
        if categories:
            params["categories"] = categories

        self.logger.debug(f"Sending search request with params: {params}")

        try:
            response = await self.client.get("/search", params=params)
            response.raise_for_status()
            data = response.json()
            self.logger.info(f"Search returned {len(data)} results")
            return [SearchResult(**item) for item in data]
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"HTTP error: {e.response.status_code} - {e.response.text}"
            )
        except Exception as e:
            self.logger.exception(f"Unexpected error during search: {e}")
        return []

    async def similar_to_title(self, title: str, top_k: int = 5) -> List[SearchResult]:
        """Papers similar to a given title."""
        self.logger.debug(f"Searching papers similar to title: '{title}'")
        return await self._search_seed(query=title, limit=top_k)

    async def by_user_interests(
        self, interests: List[str], top_k: int = 10
    ) -> List[SearchResult]:
        """Search for papers using user’s ArXiv domain interests."""
        self.logger.debug(f"Searching papers for interests: {interests}")
        valid_domains = [
            ArxivDomains(interest)
            for interest in interests
            if interest in ArxivDomains.__members__
        ]
        if not valid_domains:
            self.logger.warning("No valid ArXiv domains provided in interests.")
        return await self._search_seed(categories=valid_domains, limit=top_k)

    async def get_paper_by_id(self, paper_id: str) -> Optional[SearchResult]:
        """
        Fetch a single paper by its arXiv ID from the microservice.
        Returns a SearchResult or None if not found / on error.
        """
        self.logger.debug(f"Fetching paper by ID: {paper_id}")
        try:
            # Call the microservice /id endpoint with the paper_id as a query param
            response = await self.client.get("/id", params={"id": paper_id})
            if response.status_code == 404:
                self.logger.info(f"Paper {paper_id} not found (404)")
                return None
            response.raise_for_status()
            return SearchResult(**response.json())
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"HTTP error fetching paper {paper_id}: "
                f"{e.response.status_code} {e.response.text}"
            )
        except Exception as e:
            self.logger.exception(f"Unexpected error fetching paper {paper_id}: {e}")
        return None

    async def close(self):
        await self.client.aclose()
        self.logger.debug("HTTP client closed.")
