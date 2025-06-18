import React, { useState, useRef, useEffect } from "react";
import { Search, User, AlertCircle } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "../components/ui/popover";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { campaignsAPI, getImageUrl } from "../lib/api";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error("Error parsing recent searches:", error);
        // Reset if there's an error
        localStorage.removeItem("recentSearches");
      }
    }
  }, []);

  const handleInputClick = (e) => {
    // Prevent the default behavior that might cause the popover to close
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    // Close on Escape key
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    // Submit search on Enter key
    if (e.key === 'Enter' && searchQuery) {
      performSearch(searchQuery);
    }
  };
  
  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    // Add search query to recent searches
    const updatedSearches = [
      query,
      ...recentSearches.filter(item => item !== query) // Remove duplicates
    ].slice(0, 5); // Keep only most recent 5 searches
    
    // Update state and localStorage
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    
    // Search API request
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await campaignsAPI.searchCampaigns(query);
      setSearchResults(result.items || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('حدث خطأ أثناء البحث');
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };
  
  const goToSearchResults = () => {
    // TODO: Navigate to a dedicated search results page
    // For now, we'll just close the popover
    setIsOpen(false);
    
    // You could navigate to a search page like this:
    // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };
  
  const goToCampaign = (campaignId) => {
    setIsOpen(false);
    navigate(`/campaigns/${campaignId}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative md:block hidden w-full md:w-64">
        <PopoverTrigger asChild>
          <div className="relative w-full cursor-text" onClick={handleInputClick}>
            <Input
              ref={inputRef}
              className="bg-white pr-9 w-full md:w-64"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent
          align="start"
          className="w-full md:w-[24rem] p-0 mt-1"
          sideOffset={5}
          onInteractOutside={(e) => {
            // Only close when clicking outside the component entirely
            if (!inputRef.current?.contains(e.target)) {
              setIsOpen(false);
            }
          }}
        >
          <div className="py-2">
            {searchQuery ? (
              <div className="px-2 py-1">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="mr-2">جاري البحث...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center p-4 text-destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <>
                    {searchResults.length > 0 ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">نتائج البحث:</p>
                        {searchResults.slice(0, 5).map((campaign) => (
                          <div 
                            key={campaign.id}
                            className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer mb-1"
                            onClick={() => goToCampaign(campaign.id)}
                          >
                            <div className="h-10 w-10 rounded-md bg-accent overflow-hidden mr-3 flex-shrink-0">
                              {campaign.image_path ? (
                                <img 
                                  src={getImageUrl(campaign.image_path)} 
                                  alt={campaign.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/100/e2e8f0/64748b?text=صورة";
                                  }}
                                />
                              ) : (
                                <div className="h-full w-full bg-secondary flex items-center justify-center">
                                  <Search className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="text-sm font-medium truncate">{campaign.title}</h4>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <User className="h-3 w-3 mr-1" />
                                <span className="truncate">
                                  {campaign.creator_name || "مستخدم"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {searchResults.length > 5 && (
                          <Button 
                            variant="ghost" 
                            className="w-full justify-center text-primary text-sm mt-1"
                            onClick={goToSearchResults}
                          >
                            عرض كل النتائج ({searchResults.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        لا توجد نتائج للبحث
                      </div>
                    )}
                    
                    <div className="mt-2 border-t pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-right"
                        onClick={() => performSearch(searchQuery)}
                      >
                        <Search className="h-4 w-4 ml-2" />
                        البحث عن: {searchQuery}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {recentSearches.length > 0 ? (
                  <div className="px-2 py-1">
                    <p className="text-sm text-muted-foreground mb-2">عمليات البحث الأخيرة:</p>
                    {recentSearches.map((term, index) => (
                      <Button 
                        key={index} 
                        variant="ghost" 
                        className="w-full justify-start text-right mb-1"
                        onClick={() => {
                          setSearchQuery(term);
                          performSearch(term);
                        }}
                      >
                        {term}
                      </Button>
                    ))}
                    <div className="border-t px-2 py-1 mt-2">
                      <Button 
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-xs text-muted-foreground hover:text-primary"
                        )}
                        onClick={clearRecentSearches}
                      >
                        مسح عمليات البحث الأخيرة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                    لا توجد عمليات بحث سابقة
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
};

export default SearchBar;
