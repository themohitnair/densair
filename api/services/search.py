from config import EXA_KEY, LOG_CONFIG

from exa_py import Exa
from typing import List
from models import TermAugmenter
import logging
import asyncio


logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)


class TermSearcher:
    def __init__(self):
        self.client = Exa(api_key=EXA_KEY)

    async def get_augmenters(self, term: str) -> List[TermAugmenter]:
        exa = Exa(api_key=EXA_KEY)

        data = await asyncio.to_thread(
            exa.search_and_contents,
            f"article or repository simply explaining {term}",
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
