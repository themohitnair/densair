import React, { useState, useEffect } from 'react';
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

  // Update filters when initialFilters change (e.g., from URL)
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);
  
  // Set initial query from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('query');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call onSearch even with empty query to clear results if needed
    onSearch(query, filters);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // If query is cleared, update URL to remove query parameter
    if (!newQuery.trim()) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("query");
      window.history.replaceState(
        {}, 
        '', 
        `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
      );
    }
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex w-full gap-2 mb-4">
        <div className="flex-1 flex flex-col">
          <Input
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for papers by topic, concept, or question..."
            className="w-full"
            disabled={isLoading}
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right mt-1">
            {query.length}/500 characters
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
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