import logging.config
import random
from typing import List, Optional

import httpx
from config import LOG_CONFIG, SEARCH_API
from models import ArxivDomains, SearchResult

logging.config.dictConfig(LOG_CONFIG)


class Feed:
    def __init__(self, base_url: str = SEARCH_API):
        self.base_url = base_url
        self.client = None
        self.logger = logging.getLogger(__name__)
        self.all_domains = [domain.value for domain in ArxivDomains]

    async def __aenter__(self):
        self.client = httpx.AsyncClient(base_url=self.base_url)
        self.logger.debug("Initialized HTTP client.")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        await self.client.aclose()
        self.logger.debug("Closed HTTP client.")

    async def get_mixed_feed(
        self, user_interests: List[str], total_items: int = 20
    ) -> List[SearchResult]:
        """
        Creates a mixed feed with 70% from user interests and 30% exploration.
        Uses maximum two requests to the microservice.

        Args:
            user_interests: List of user's ArXiv domain interests
            total_items: Total number of items to return in the feed

        Returns:
            List of SearchResult objects representing the mixed feed
        """
        self.logger.debug(f"Generating mixed feed for interests: {user_interests}")

        valid_interests = [
            interest
            for interest in user_interests
            if interest in [d.value for d in ArxivDomains]
        ]
        if len(valid_interests) < 2:
            self.logger.warning(
                f"User has fewer than 2 valid interests: {valid_interests}"
            )
            valid_interests = (
                random.sample(self.all_domains, 2)
                if len(valid_interests) == 0
                else valid_interests
                + [
                    random.choice(
                        [d for d in self.all_domains if d not in valid_interests]
                    )
                ]
            )
            self.logger.info(f"Using default interests: {valid_interests}")

        interest_count = int(total_items * 0.7)
        exploration_count = total_items - interest_count

        results = []

        if interest_count > 0:
            selected_interests = random.sample(
                valid_interests,
                k=min(len(valid_interests), random.randint(2, len(valid_interests))),
            )
            interest_results = await self._search_by_categories(
                categories=[ArxivDomains(interest) for interest in selected_interests],
                categories_match_all=False,
                limit=interest_count,
            )
            results.extend(interest_results)
            self.logger.info(
                f"Retrieved {len(interest_results)} papers from user interests"
            )
        if exploration_count > 0:
            exploration_domains = [
                d for d in self.all_domains if d not in valid_interests
            ]
            if not exploration_domains:
                exploration_domains = self.all_domains

            selected_exploration = random.sample(
                exploration_domains,
                k=min(
                    len(exploration_domains),
                    random.randint(1, min(3, len(exploration_domains))),
                ),
            )

            exploration_results = await self._search_by_categories(
                categories=[ArxivDomains(domain) for domain in selected_exploration],
                categories_match_all=False,
                limit=exploration_count,
            )
            results.extend(exploration_results)
            self.logger.info(
                f"Retrieved {len(exploration_results)} papers for exploration"
            )
        random.shuffle(results)

        return results[:total_items]

    async def similar_to_title(self, title: str, top_k: int = 5) -> List[SearchResult]:
        """
        Get papers similar to the provided title.

        Args:
            title: The title to find similar papers for
            top_k: Maximum number of similar papers to return

        Returns:
            List of SearchResult objects representing similar papers
        """
        if not self.client:
            raise RuntimeError(
                "HTTP client not initialized. Use 'async with' context manager."
            )

        self.logger.debug(f"Finding papers similar to title: '{title}'")

        try:
            response = await self.client.get(
                "/search", params={"query": title, "limit": top_k}
            )
            response.raise_for_status()

            data = response.json()
            results = [SearchResult(**item) for item in data]

            self.logger.debug(f"Found {len(results)} papers similar to '{title}'")
            return results
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"HTTP error during similar search: {e.response.status_code} - {e.response.text}"
            )
            raise
        except Exception as e:
            self.logger.error(f"Error during similar search: {str(e)}")
            raise

    async def search_papers_request(
        self,
        query: Optional[str] = None,
        categories: Optional[List[str]] = None,
        categories_match_all: bool = False,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        limit: int = 10,
    ) -> List[SearchResult]:
        """
        Search papers by query and/or categories.

        Args:
            query: Optional search query string
            categories: Optional list of category strings
            categories_match_all: If True, match all categories (AND), otherwise match any (OR)
            date_from: Optional start date for filtering
            date_to: Optional end date for filtering
            limit: Maximum number of results to return

        Returns:
            List of SearchResult objects matching the search criteria
        """
        if not self.client:
            raise RuntimeError(
                "HTTP client not initialized. Use 'async with' context manager."
            )

        self.logger.debug(
            f"Searching papers with query: {query}, categories: {categories}"
        )

        params = {}

        if query:
            params["query"] = query

        if categories:
            valid_categories = [cat for cat in categories if cat in self.all_domains]
            if valid_categories:
                params["categories"] = valid_categories
                params["match_all"] = "true" if categories_match_all else "false"

        if date_from:
            params["date_from"] = date_from

        if date_to:
            params["date_to"] = date_to

        params["limit"] = limit

        try:
            response = await self.client.get("/search", params=params)
            response.raise_for_status()

            data = response.json()
            results = [SearchResult(**item) for item in data]

            self.logger.debug(
                f"Retrieved {len(results)} papers matching search criteria"
            )
            return results
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"HTTP error during search: {e.response.status_code} - {e.response.text}"
            )
            raise
        except Exception as e:
            self.logger.error(f"Error during search: {str(e)}")
            raise

    async def close(self):
        await self.client.aclose()
        self.logger.debug("HTTP client closed.")

    async def _search_by_categories(
        self, categories: List[ArxivDomains], categories_match_all: bool, limit: int
    ) -> List[SearchResult]:
        """
        Private method to search for papers based on categories.

        Args:
            categories: List of ArxivDomains categories to search for
            categories_match_all: If True, match all categories (AND), otherwise match any (OR)
            limit: Maximum number of results to return

        Returns:
            List of SearchResult objects
        """
        if not self.client:
            raise RuntimeError(
                "HTTP client not initialized. Use 'async with' context manager."
            )

        self.logger.debug(
            f"Searching for papers with categories: {[c.value for c in categories]}, match_all={categories_match_all}"
        )

        category_values = [category.value for category in categories]

        params = {
            "categories": category_values,
            "match_all": "true" if categories_match_all else "false",
            "limit": limit,
        }

        try:
            response = await self.client.get("/search", params=params)
            response.raise_for_status()

            data = response.json()
            results = [SearchResult(**item) for item in data]

            self.logger.debug(f"Retrieved {len(results)} papers matching the criteria")
            return results
        except httpx.HTTPStatusError as e:
            self.logger.error(
                f"HTTP error during search: {e.response.status_code} - {e.response.text}"
            )
            raise
        except Exception as e:
            self.logger.error(f"Error during search: {str(e)}")
            raise

    async def _search_seed(
        self,
        categories: Optional[List[ArxivDomains]] = None,
        categories_match_all: bool = False,
        limit: int = 10,
        query: Optional[str] = None,
    ) -> List[SearchResult]:
        """
        Backward-compatible search method that supports both category-based and query-based searches.

        Args:
            categories: Optional list of ArxivDomains categories
            categories_match_all: If True, match all categories (AND), otherwise match any (OR)
            limit: Maximum number of results to return
            query: Optional search query string

        Returns:
            List of SearchResult objects
        """
        if query is not None:
            return await self.search_papers_request(query=query, limit=limit)
        elif categories is not None:
            return await self._search_by_categories(
                categories=categories,
                categories_match_all=categories_match_all,
                limit=limit,
            )
        else:
            self.logger.error("Neither query nor categories provided for search")
            return []
