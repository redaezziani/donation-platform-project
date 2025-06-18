import React, { useState, useRef, useEffect } from "react";
import { Search, X, Clock, ArrowUpRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const SearchBar = ({ 
  onSearch, 
  placeholder, 
  className = "",
  showRecentSearches = true,
  maxRecentSearches = 5
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading recent searches:', error);
        }
      }
    }
  }, [showRecentSearches]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    try {
      // Add to recent searches
      if (showRecentSearches) {
        const updatedRecent = [
          searchQuery,
          ...recentSearches.filter(item => item !== searchQuery)
        ].slice(0, maxRecentSearches);
        
        setRecentSearches(updatedRecent);
        localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      }

      // Execute search
      if (onSearch) {
        await onSearch(searchQuery);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 || showRecentSearches);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearQuery = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleRecentSearch = (searchTerm) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || t('common.searchFor')}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={clearQuery}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <CardContent className="p-2">
            {/* Current Query */}
            {query.trim() && (
              <div className="mb-2">
                <button
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-muted rounded-md transition-colors"
                  onClick={() => handleSearch()}
                  disabled={isLoading}
                >
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 truncate">
                    {t('common.searchFor')} "{query}"
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              </div>
            )}

            {/* Recent Searches */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 px-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {t('common.recentSearches')}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto p-1"
                    onClick={clearRecentSearches}
                  >
                    {t('common.clearRecentSearches')}
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((searchTerm, index) => (
                    <button
                      key={`${searchTerm}-${index}`}
                      className="w-full flex items-center gap-3 p-2 text-left hover:bg-muted rounded-md transition-colors"
                      onClick={() => handleRecentSearch(searchTerm)}
                    >
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate text-sm">{searchTerm}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Recent Searches State */}
            {showRecentSearches && recentSearches.length === 0 && !query.trim() && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {t('common.noRecentSearches')}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-2">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  {t('common.searching')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
