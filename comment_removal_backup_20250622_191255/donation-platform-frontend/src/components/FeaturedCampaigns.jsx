import React, { useEffect, useState, useCallback } from "react";
import { campaignsAPI, getImageUrl } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

const FeaturedCampaignCard = ({ campaign, index }) => {
  const { t } = useLanguage();
  const progress = campaign.goal_amount > 0 ? (campaign.raised_amount / campaign.goal_amount) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-lg border border-border bg-background shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl(campaign.image_url) || "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge 
          variant="default"
          className="absolute top-2 right-2"
        >
          {t('campaign.featured', 'مميزة')}
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {campaign.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('campaign.raised', 'تم جمع')}
            </span>
            <span className="font-medium">
              ${campaign.raised_amount?.toLocaleString() || 0}
            </span>
          </div>
          
          <Progress value={Math.min(progress, 100)} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('campaign.goal', 'الهدف')}: ${campaign.goal_amount?.toLocaleString() || 0}
            </span>
            <span className="font-medium text-primary">
              {progress.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <Link to={`/campaigns/${campaign.id}`}>
          <Button className="w-full">
            {t('campaign.viewDetails', 'عرض التفاصيل')}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

const FeaturedCampaigns = () => {
  const { t, useLanguageRefresh } = useLanguage();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const fetchFeaturedCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let campaigns = [];
      
      try {
        // Try the dedicated featured campaigns endpoint first
        campaigns = await campaignsAPI.getFeaturedCampaigns();
      } catch (featuredError) {
        console.warn("Featured campaigns endpoint failed, falling back to public campaigns:", featuredError);
        // Fallback to public campaigns if featured endpoint fails
        const data = await campaignsAPI.getPublicCampaigns(1, 3);
        campaigns = data.items || [];
      }
      
      // Add progress calculation for display
      const campaignsWithProgress = campaigns.map(campaign => ({
        ...campaign,
        progress: campaign.goal_amount > 0 ? (campaign.raised_amount / campaign.goal_amount) * 100 : 0
      }));
      
      setFeaturedCampaigns(campaignsWithProgress);
    } catch (err) {
      console.error("Error fetching featured campaigns:", err);
      setError(t('messages.errorLoadingData', 'خطأ في تحميل البيانات'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Refresh campaigns when language changes
  const refreshFeaturedCampaigns = useCallback(() => {
    fetchFeaturedCampaigns();
  }, [fetchFeaturedCampaigns]);

  useLanguageRefresh(refreshFeaturedCampaigns);

  useEffect(() => {
    fetchFeaturedCampaigns();
  }, [fetchFeaturedCampaigns]);

  if (!isInView && !loading && featuredCampaigns.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="w-full grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-2 p-4 mt-4">
      {/* Main featured campaign (large card) */}
      <div className="w-full col-span-2 h-96 overflow-hidden relative rounded-lg border border-border inset-shadow-xs">
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        {!loading && featuredCampaigns[0] && (
          <Link to={`/campaigns/${featuredCampaigns[0].id}`} className="block h-full">
            <div className="relative h-full group">
              <img
                src={getImageUrl(featuredCampaigns[0].image_url) || "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="}
                alt={featuredCampaigns[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <Badge 
                variant="default"
                className="absolute top-4 right-4 z-10"
              >
                {t('campaign.featured', 'مميزة')}
              </Badge>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2 line-clamp-2">
                  {featuredCampaigns[0].title}
                </h3>
                <p className="text-sm text-white/80 mb-4 line-clamp-2">
                  {featuredCampaigns[0].description}
                </p>
              <div className="flex justify-between items-center text-xs">
                    <span>${featuredCampaigns[0].raised_amount?.toLocaleString() || 0}</span>
                  </div>
              </div>
            </div>
          </Link>
        )}
        {!loading && !featuredCampaigns[0] && (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <p>{t('home.noFeaturedCampaigns', 'لا توجد حملات مميزة متاحة حالياً.')}</p>
          </div>
        )}
      </div>
      
      {/* Two smaller featured campaigns */}
      <div className="w-full col-span-1 h-96 overflow-hidden relative grid grid-rows-2 gap-2">
        <div className="w-full h-full  overflow-hidden relative rounded-lg border border-border inset-shadow-xs">
          {loading && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {!loading && featuredCampaigns[1] && (
            <Link to={`/campaigns/${featuredCampaigns[1].id}`} className="block h-full">
              <div className="relative h-full group">
                <img
                  src={getImageUrl(featuredCampaigns[1].image_url) || "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="}
                  alt={featuredCampaigns[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                    {featuredCampaigns[1].title}
                  </h4>
                  <p className="text-xs text-white/80 mb-2 line-clamp-2">
                    {featuredCampaigns[1].description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span>${featuredCampaigns[1].raised_amount?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
        
        <div className="w-full h-full overflow-hidden relative rounded-lg border border-border inset-shadow-xs">
          {loading && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {!loading && featuredCampaigns[2] && (
            <Link to={`/campaigns/${featuredCampaigns[2].id}`} className="block h-full">
              <div className="relative h-full group">
                <img
                  src={getImageUrl(featuredCampaigns[2].image_url) || "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="}
                  alt={featuredCampaigns[2].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                    {featuredCampaigns[2].title}
                  </h4>
                  <p className="text-xs text-white/80 mb-1 line-clamp-1">
                    {featuredCampaigns[2].description}
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span>${featuredCampaigns[2].raised_amount?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {!loading && featuredCampaigns.length === 0 && (
        <div className="col-span-3 text-center text-muted-foreground py-12">
          <p>{t('home.noFeaturedCampaigns', 'لا توجد حملات مميزة متاحة حالياً.')}</p>
        </div>
      )}
    </div>
  );
};

export default FeaturedCampaigns;
