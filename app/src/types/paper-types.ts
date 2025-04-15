export interface FigureSummary {
  figure_num: string
  figure_summary: string
}

export interface Summaries {
  overall_summary: {
    summary: string
    context: string
  }
  terms_and_summaries: {
    key_terms: string[]
    abs_explanation: string
    meth_explanation: string
    conc_explanation: string
  }
  table_and_figure_summaries: {
    table_and_figure_summaries: FigureSummary[]
  }
}

export interface Augmenter {
  title: string
  url: string
}

export interface AugmenterGroup {
  term: string
  augmenters: Augmenter[]
}
