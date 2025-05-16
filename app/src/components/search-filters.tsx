import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, X } from 'lucide-react';
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
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters({...filters});
    setFromDate(filters.dateFrom ? new Date(filters.dateFrom) : undefined);
    setToDate(filters.dateTo ? new Date(filters.dateTo) : undefined);
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

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    const newFilters = {
      ...localFilters,
      dateFrom: date ? date.toISOString().split('T')[0] : null
    };
    updateFilters(newFilters);
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    const newFilters = {
      ...localFilters,
      dateTo: date ? date.toISOString().split('T')[0] : null
    };
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      categories: [],
      categoriesMatchAll: false,
      dateFrom: null,
      dateTo: null
    };
    setLocalFilters(emptyFilters);
    setFromDate(undefined);
    setToDate(undefined);
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
    setFromDate(undefined);
    setToDate(undefined);
    const newFilters = {
      ...localFilters,
      dateFrom: null,
      dateTo: null
    };
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
                    ? `${format(new Date(localFilters.dateFrom), "MMM d, yyyy")} - ${format(new Date(localFilters.dateTo), "MMM d, yyyy")}`
                    : localFilters.dateFrom 
                      ? `From ${format(new Date(localFilters.dateFrom), "MMM d, yyyy")}`
                      : `Until ${format(new Date(localFilters.dateTo!), "MMM d, yyyy")}`
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
                    <Label htmlFor="date-from" className="text-sm">From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-from"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={handleFromDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="date-to" className="text-sm">To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-to"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={isLoading}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={handleToDateChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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