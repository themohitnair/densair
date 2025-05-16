import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';
import { ARXIV_DOMAINS } from "@/constants/arxiv";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface SearchFilters {
  categories: string[];
  categoriesMatchAll: boolean;
  dateFrom: string | null;
  dateTo: string | null;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isLoading: boolean;
}

export function SearchFilters({ filters, onFiltersChange, isLoading }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>({...filters});
  const [dateFromInput, setDateFromInput] = useState<string>(filters.dateFrom || '');
  const [dateToInput, setDateToInput] = useState<string>(filters.dateTo || '');
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters({...filters});
    setDateFromInput(filters.dateFrom || '');
    setDateToInput(filters.dateTo || '');
  }, [filters]);

  const updateFilters = (newFilters: SearchFilters) => {
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryToggle = (abbreviation: string) => {
    const newFilters = {
      ...localFilters,
      categories: localFilters.categories.includes(abbreviation)
        ? localFilters.categories.filter(c => c !== abbreviation)
        : [...localFilters.categories, abbreviation]
    };
    updateFilters(newFilters);
  };

  const formatDateInput = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with hyphens (YYYY-MM-DD)
    if (digits.length <= 4) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    } else {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    }
  };

  const validateDate = (dateString: string): boolean => {
    // Check if it matches YYYY-MM-DD format and is a valid date
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const handleFromDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatDateInput(inputValue);
    
    // Always update the local input state for UI feedback
    setDateFromInput(formatted);
    
    // Only update parent state/URL when we have a complete, valid date
    // or when the field is completely cleared
    if (formatted === '' || validateDate(formatted)) {
      const newFilters = {
        ...localFilters,
        dateFrom: formatted || null
      };
      updateFilters(newFilters);
    }
  };

  const handleToDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatDateInput(inputValue);
    
    // Always update the local input state for UI feedback
    setDateToInput(formatted);
    
    // Only update parent state/URL when we have a complete, valid date
    // or when the field is completely cleared
    if (formatted === '' || validateDate(formatted)) {
      const newFilters = {
        ...localFilters,
        dateTo: formatted || null
      };
      updateFilters(newFilters);
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      categories: [],
      categoriesMatchAll: false,
      dateFrom: null,
      dateTo: null
    };
    setLocalFilters(emptyFilters);
    setDateFromInput('');
    setDateToInput('');
    onFiltersChange(emptyFilters);
  };

  const handleRemoveCategory = (category: string) => {
    const newFilters = {
      ...localFilters,
      categories: localFilters.categories.filter(c => c !== category)
    };
    updateFilters(newFilters);
  };

  const handleRemoveDateRange = () => {
    const newFilters = {
      ...localFilters,
      dateFrom: null,
      dateTo: null
    };
    setDateFromInput('');
    setDateToInput('');
    updateFilters(newFilters);
  };

  const handleCategoriesMatchAllChange = (checked: boolean) => {
    const newFilters = {
      ...localFilters,
      categoriesMatchAll: checked
    };
    updateFilters(newFilters);
  };

  const activeFilterCount = 
    (localFilters.categories.length > 0 ? 1 : 0) + 
    (localFilters.dateFrom || localFilters.dateTo ? 1 : 0);

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4">
        {/* Active filters display */}
        {activeFilterCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Active Filters</h3>
              <Button
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground h-auto py-1"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localFilters.categories.map(category => {
                const domain = ARXIV_DOMAINS.find(d => d.abbreviation === category);
                return (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {domain?.name || category}
                    <button 
                      onClick={() => handleRemoveCategory(category)}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {domain?.name || category} filter</span>
                    </button>
                  </Badge>
                );
              })}
              {(localFilters.dateFrom || localFilters.dateTo) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {localFilters.dateFrom && localFilters.dateTo 
                    ? `${localFilters.dateFrom} - ${localFilters.dateTo}`
                    : localFilters.dateFrom 
                      ? `From ${localFilters.dateFrom}`
                      : `Until ${localFilters.dateTo!}`
                  }
                  <button 
                    onClick={handleRemoveDateRange}
                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove date range filter</span>
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Filter sections */}
        <div className="border rounded-md overflow-hidden">
          <Accordion type="multiple" defaultValue={[]} className="w-full">
            <AccordionItem value="categories" className="border-b">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                Categories
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                  {ARXIV_DOMAINS.map(domain => (
                    <div key={domain.abbreviation} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${domain.abbreviation}`}
                        checked={localFilters.categories.includes(domain.abbreviation)}
                        onCheckedChange={() => handleCategoryToggle(domain.abbreviation)}
                        disabled={isLoading}
                      />
                      <Label 
                        htmlFor={`category-${domain.abbreviation}`} 
                        className="text-sm cursor-pointer"
                      >
                        {domain.name}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
                  <Checkbox 
                    id="match-all"
                    checked={localFilters.categoriesMatchAll}
                    onCheckedChange={(checked) => 
                      handleCategoriesMatchAllChange(!!checked)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="match-all" className="text-sm cursor-pointer">
                    Match all categories
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="date-range" className="border-b-0">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                Date Range
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="date-from" className="text-sm">From (YYYY-MM-DD)</Label>
                    <Input
                      id="date-from"
                      placeholder="YYYY-MM-DD"
                      value={dateFromInput}
                      onChange={handleFromDateInputChange}
                      className="font-mono"
                      disabled={isLoading}
                      maxLength={10}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="date-to" className="text-sm">To (YYYY-MM-DD)</Label>
                    <Input
                      id="date-to"
                      placeholder="YYYY-MM-DD"
                      value={dateToInput}
                      onChange={handleToDateInputChange}
                      className="font-mono"
                      disabled={isLoading}
                      maxLength={10}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}