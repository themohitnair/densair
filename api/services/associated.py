import arxiv
from models import RelatedPaper, RelatedPapers


def get_associated_papers(domain: str, n: int = 3) -> RelatedPapers:
    domain = domain.lower()
    search = arxiv.Search(
        query=f"(abs:{domain})",
        max_results=n,
        sort_by=arxiv.SortCriterion.Relevance,
    )
    rel_paps = []
    for result in search.results():
        rel_pap = RelatedPaper(
            id=result.get_short_id(), title=result.title, url=result.pdf_url
        )
        rel_paps.append(rel_pap)
    return RelatedPapers(results=rel_paps)
