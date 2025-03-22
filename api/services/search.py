from config import EXA_KEY, LOG_CONFIG

from models import TermAugmenter

from exa_py import Exa
from typing import List
import logging
import asyncio


logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


class TermSearcher:
    def __init__(self, term: str, context: str):
        self.client = Exa(api_key=EXA_KEY)
        self.term = term
        self.context = context

    async def get_augmenters(self) -> List[TermAugmenter]:
        exa = Exa(api_key=EXA_KEY)

        data = await asyncio.to_thread(
            exa.search_and_contents,
            f"Resources simply explaining {self.term} in the context of {self.context}",
            text=True,
            num_results=3,
            type="neural",
            use_autoprompt=False,
        )

        logger.info("Search results received.")

        results = data.results
        augmenters = []
        for result in results:
            augmenters.append(
                TermAugmenter(
                    title=result.title,
                    url=result.url,
                )
            )

        logger.info("Augmenters created.")
        return augmenters
