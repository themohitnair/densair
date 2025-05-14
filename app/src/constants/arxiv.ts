export interface ArxivDomain {
  name: string;
  abbreviation: string;
  description?: string;
}

export const ARXIV_DOMAINS: ArxivDomain[] = [
  { name: "Computer Science", abbreviation: "cs" },
  { name: "Economics", abbreviation: "econ" },
  { name: "Electrical Engineering and Systems Science", abbreviation: "eess" },
  { name: "Mathematics", abbreviation: "math" },
  { name: "Astrophysics", abbreviation: "astro-ph" },
  { name: "Condensed Matter", abbreviation: "cond-mat" },
  { name: "General Relativity and Quantum Cosmology", abbreviation: "gr-qc" },
  { name: "High Energy Physics", abbreviation: "hep" },
  { name: "Mathematical Physics", abbreviation: "math-ph" },
  { name: "Nuclear Theory", abbreviation: "nucl" },
  { name: "Quantum Physics", abbreviation: "quant-ph" },
  { name: "Physics", abbreviation: "physics" },
  { name: "Quantitative Biology", abbreviation: "q-bio" },
  { name: "Quantitative Finance", abbreviation: "q-fin" },
  { name: "Statistics", abbreviation: "stat" },
  { name: "Nonlinear Sciences", abbreviation: "nlin"}
];

export const ARXIV_DOMAIN_NAMES = ARXIV_DOMAINS.map(domain => domain.name);
export const ARXIV_DOMAIN_ABBREVIATIONS = ARXIV_DOMAINS.map(domain => domain.abbreviation);

export function getAbbreviationFromName(name: string): string | undefined {
  const domain = ARXIV_DOMAINS.find(d => d.name === name);
  return domain?.abbreviation;
}

export function getNameFromAbbreviation(abbreviation: string): string | undefined {
  const domain = ARXIV_DOMAINS.find(d => d.abbreviation === abbreviation);
  return domain?.name;
}

export function convertNamesToAbbreviations(names: string[]): string[] {
  return names
    .map(name => getAbbreviationFromName(name))
    .filter((abbr): abbr is string => abbr !== undefined);
}

export function convertAbbreviationsToNames(abbreviations: string[]): string[] {
  return abbreviations
    .map(abbr => getNameFromAbbreviation(abbr))
    .filter((name): name is string => name !== undefined);
}
