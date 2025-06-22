import React, { useEffect, useState, useCallback } from "react";
import { campaignsAPI } from "@/lib/api";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import ArticalCard from "../components/card-ui/artical-card";
import PaginationComponent from "../components/PaginationComponent";
import SearchBar from "../components/SearchBar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Search, Filter, X } from "lucide-react";

const CampaignsPage = () => {
  const { t, useLanguageRefresh } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12); // More items per page for campaigns page
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  
  // Animation ref
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const fetchCampaigns = useCallback(async (page = 1, search = "", status = "all", sort = "newest") => {
    setLoading(true);
    setError("");
    try {
      let data;
      
      if (search.trim()) {
        // Use search API if there's a search query
        data = await campaignsAPI.searchCampaigns(search, page, pageSize, status === "all" ? null : status);
      } else {
        // Use regular public campaigns API
        data = await campaignsAPI.getPublicCampaigns(page, pageSize);
      }
      
      let filteredCampaigns = data.items || [];
      
      // Sort campaigns based on selected option
      switch (sort) {
        case "newest":
          filteredCampaigns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case "oldest":
          filteredCampaigns.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case "most_raised":
          filteredCampaigns.sort((a, b) => (b.raised_amount || 0) - (a.raised_amount || 0));
          break;
        case "least_raised":
          filteredCampaigns.sort((a, b) => (a.raised_amount || 0) - (b.raised_amount || 0));
          break;
        case "goal_amount":
          filteredCampaigns.sort((a, b) => (b.goal_amount || 0) - (a.goal_amount || 0));
          break;
        default:
          break;
      }
      
      setCampaigns(filteredCampaigns);
      
      // Update pagination data from API response
      if (data.pagination) {
        setTotalPages(data.pagination.total_pages || 1);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(t('messages.errorLoadingData', 'خطأ في تحميل البيانات'));
    } finally {
      setLoading(false);
    }
  }, [pageSize, t]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCampaigns(page, searchQuery, statusFilter, sortBy);
    // Scroll to top of campaigns for better UX
    document.getElementById('campaigns-header')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
    fetchCampaigns(1, query, statusFilter, sortBy);
  };

  // Handle filter changes
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchCampaigns(1, searchQuery, status, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    fetchCampaigns(1, searchQuery, statusFilter, sort);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
    fetchCampaigns(1, "", "all", "newest");
  };

  // Refresh campaigns when language changes
  const refreshCampaigns = useCallback(() => {
    fetchCampaigns(currentPage, searchQuery, statusFilter, sortBy);
  }, [fetchCampaigns, currentPage, searchQuery, statusFilter, sortBy]);

  useLanguageRefresh(refreshCampaigns);

  useEffect(() => {
    fetchCampaigns(currentPage, searchQuery, statusFilter, sortBy);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-primary/10 to-primary/5 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 id="campaigns-header" className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t('navigation.browseCampaigns', 'تصفح الحملات')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {t('home.campaignsDescription', 'استعرض الحملات المتاحة وتبرع للمساعدة في تحقيق أهدافها.')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('campaign.searchPlaceholder', 'البحث عن حملة...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => handleSearch(searchQuery)}>
                {t('common.search', 'بحث')}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {t('common.filters', 'المرشحات')}
                </Button>

                {(searchQuery || statusFilter !== "all" || sortBy !== "newest") && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    {t('common.clearFilters', 'مسح المرشحات')}
                  </Button>
                )}
              </div>

              {/* Quick Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t('common.sortBy', 'ترتيب حسب')}:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('common.newest', 'الأحدث')}</SelectItem>
                    <SelectItem value="oldest">{t('common.oldest', 'الأقدم')}</SelectItem>
                    <SelectItem value="most_raised">{t('common.mostRaised', 'الأكثر جمعاً')}</SelectItem>
                    <SelectItem value="least_raised">{t('common.leastRaised', 'الأقل جمعاً')}</SelectItem>
                    <SelectItem value="goal_amount">{t('common.highestGoal', 'أعلى هدف')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t('campaign.status.label', 'الحالة')}
                    </label>
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all', 'الكل')}</SelectItem>
                        <SelectItem value="active">{t('campaign.status.active', 'نشطة')}</SelectItem>
                        <SelectItem value="completed">{t('campaign.status.completed', 'مكتملة')}</SelectItem>
                        <SelectItem value="draft">{t('campaign.status.draft', 'مسودة')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Active Filters Display */}
        {(searchQuery || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-muted-foreground">{t('common.activeFilters', 'المرشحات النشطة')}:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {t('common.search', 'بحث')}: {searchQuery}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleSearch("")}
                />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {t('campaign.status.label', 'الحالة')}: {t(`campaign.status.${statusFilter}`, statusFilter)}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleStatusFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? (
              t('campaign.loading', 'جاري تحميل الحملات...')
            ) : (
              t('common.resultsSummary', 'عرض {{count}} حملة', { count: campaigns.length })
            )}
          </p>
        </div>

        {/* Campaigns Grid */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading && (
            <div className="w-full flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive text-lg">{error}</p>
            </div>
          )}

          {!loading && campaigns.length > 0 && (
            <div className="flex flex-col gap-4 w-full">
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ArticalCard campaign={campaign} />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && campaigns.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                {t('home.noCampaigns', 'لا توجد حملات متاحة حالياً.')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('campaigns.tryDifferentFilters', 'جرب مرشحات مختلفة أو امسح الفلاتر الحالية.')}
              </p>
              <Button onClick={clearFilters}>
                {t('common.clearFilters', 'مسح المرشحات')}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full mt-12">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              paginationItemsToDisplay={7}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsPage;
