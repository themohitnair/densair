import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { SearchFilters, type SearchFilters as SearchFiltersType } from '@/components/search-filters';

interface SemanticSearchProps {
  onSearch: (query: string, filters: SearchFiltersType) => void;
  isLoading: boolean;
  initialFilters?: SearchFiltersType;
}

export function SemanticSearch({ onSearch, isLoading, initialFilters }: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters || {
    categories: [],
    categoriesMatchAll: false,
    dateFrom: null,
    dateTo: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, filters);
    }
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex w-full gap-2 mb-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for papers by topic, concept, or question..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !query.trim()}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      <div className="flex justify-center">
        <SearchFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
