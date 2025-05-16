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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, filters);
    }
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    
    // Update URL to reflect filter changes without triggering a search
    const urlParams = new URLSearchParams(window.location.search);
    
    // Preserve query and other non-filter params
    const query = urlParams.get('query');
    const interests = urlParams.getAll('interests');
    
    // Clear existing filter params
    urlParams.delete("categories");
    urlParams.delete("categories_match_all");
    urlParams.delete("date_from");
    urlParams.delete("date_to");
    
    // Re-add query if it exists
    if (query) {
      urlParams.set('query', query);
    }
    
    // Re-add interests if they exist
    interests.forEach(interest => {
      urlParams.append('interests', interest);
    });
    
    // Add new filter params
    newFilters.categories.forEach(cat => urlParams.append("categories", cat));
    if (newFilters.categoriesMatchAll) urlParams.set("categories_match_all", "true");
    if (newFilters.dateFrom) urlParams.set("date_from", newFilters.dateFrom);
    if (newFilters.dateTo) urlParams.set("date_to", newFilters.dateTo);
    
    // Update URL without navigation
    window.history.replaceState(
      {}, 
      '', 
      `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
    );
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