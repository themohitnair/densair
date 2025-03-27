from config import EXA_KEY, LOG_CONFIG

from models import TermAugmenter

from exa_py import Exa
from typing import List
import logging
import asyncio


logging.config.dictConfig(LOG_CONFIG)


class TermSearcher:
    def __init__(self, term: str, context: str):
        self.client = Exa(api_key=EXA_KEY)
        self.term = term
        self.context = context
        self.logger = logging.getLogger(__name__)

    async def get_augmenters(self) -> List[TermAugmenter]:
        try:
            data = await asyncio.to_thread(
                self.client.search_and_contents,
                f"Resources simply explaining {self.term} in the context of {self.context}",
                text=True,
                num_results=3,
                type="neural",
                use_autoprompt=False,
            )

            self.logger.info("Search results received.")

            results = data.results
            augmenters = []
            for result in results:
                augmenters.append(
                    TermAugmenter(
                        title=result.title,
                        url=result.url,
                    )
                )

            self.logger.info("Augmenters created.")
            return augmenters
        except Exception as e:
            self.logger.error(f"Error in get_augmenters: {e}")
            raise
