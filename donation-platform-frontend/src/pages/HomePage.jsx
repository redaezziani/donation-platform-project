import React, { useEffect, useState, useCallback } from "react";
import { campaignsAPI, getImageUrl } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import ArticalCard from "../components/card-ui/artical-card";
import PaginationComponent from "../components/PaginationComponent";
import CreateCampaignSheet from "../components/create-campaign";
import FeaturedCampaigns from "../components/FeaturedCampaigns";

const NumberCounter = ({ value, label, icon }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      const duration = 2000; // 2 seconds
      const increment = Math.ceil(end / (duration / 16)); // 16ms per frame

      const timer = setInterval(() => {
        start += increment;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-between "
    >
      <div className="text-sm text-muted-foreground mb-2 ">{label}</div>
      <div className="text-4xl text-shadow-md font-black ">{count.toLocaleString()} +</div>
      <div className="text-3xl text-primary mb-2">{icon}</div>
    </motion.div>
  );
};

const HomePage = () => {
  const { t, useLanguageRefresh } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(6); // Number of items per page

  const fetchCampaigns = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      // Use getPublicCampaigns to only fetch active, admin-approved campaigns
      const data = await campaignsAPI.getPublicCampaigns(page, pageSize);
      console.log("Fetched approved campaigns:", data);
      setCampaigns(data.items || []);
      
      // Update pagination data from API response
      if (data.pagination) {
        setTotalPages(data.pagination.total_pages || 1);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(t('messages.errorLoadingData'));
    } finally {
      setLoading(false);
    }
  }, [pageSize, t]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCampaigns(page);
    // Scroll to campaigns section for better UX
    document.getElementById('campaigns-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Refresh campaigns when language changes
  const refreshCampaigns = useCallback(() => {
    fetchCampaigns(currentPage);
  }, [fetchCampaigns, currentPage]);

  useLanguageRefresh(refreshCampaigns);

  useEffect(() => {
    fetchCampaigns(currentPage);
  }, []);

  return (
    <div className="">
      <div className="w-full flex max-h-[80vh] overflow-hidden relative">
        <span className="z-[30] absolute inset-0 bg-black/50 flex items-center justify-center"/>

        <article className=" z-[30] absolute inset-0 p-4 md:p-10 flex flex-col justify-end items-start">
          <h1 className=" text-2xl md:text-6xl text-shadow-xs font-AlRaiMediaBold font-bold text-primary mb-4">
            {t('home.welcomeTitle', 'مرحبًا بكم في منصة التبرعات')}
          </h1>
          <p className=" text-xs md:text-lg line-clamp-3 md:line-clamp-none text-white/80 max-w-[45rem] mb-4">
            {t('home.description', 'استعرض الحملات المتاحة على منصتنا واكتشف المبادرات الإنسانية والاجتماعية التي تحتاج إلى دعمك. يمكنك اختيار القضايا التي تهمك، سواء كانت متعلقة بالتعليم، الصحة، الغذاء، أو الإغاثة في حالات الطوارئ. تبرعك، مهما كان حجمه، يسهم بشكل مباشر في تحسين حياة الآخرين وتحقيق أثر إيجابي ملموس. كن جزءًا من التغيير وساهم في بناء مستقبل أفضل!')}
          </p>
          <div className="flex gap-2">
            <Link to="/about">
              <Button variant={"secondary"}>{t('home.learnMore', 'المزيد عن المنصة')}</Button>
            </Link>
            <CreateCampaignSheet/>
          </div>
        </article>
        <img
          src="https://www.worldvision.org.uk/media/5iahsfjo/d232-0344-226_.jpg"
          alt="Cover"
          className="w-full h-full object-center"
        />
      </div>
      <div className="max-w-7xl mx-auto p-4 mt-8  flex justify-between items-center gap-4 flex-wrap">
        <NumberCounter value={1000} label={t('home.stats.activeDonors', 'إجمالي عدد المتبرعين النشطين')} icon="" />
        <NumberCounter value={50000} label={t('home.stats.totalDonations', 'المبلغ الإجمالي للتبرعات المستلمة')} icon="" />
        <NumberCounter value={120} label={t('home.stats.completedCampaigns', 'عدد الحملات الناجحة المكتملة')} icon="" />
        <NumberCounter value={30} label={t('home.stats.countries', 'عدد الدول المشاركة في المنصة')} icon="" />
      </div>
      <div id="campaigns-section" className="max-w-7xl  flex gap-1 flex-col items-start justify-start mx-auto p-4 mt-10">
        <h1 className="text-xl font-bold ">{t('home.allCampaigns', 'جميع الحملات')}</h1>
        <p className=" mb-4 text-muted-foreground">
          {t('home.campaignsDescription', 'استعرض الحملات المتاحة وتبرع للمساعدة في تحقيق أهدافها.')}
        </p>
        {loading && (
          <div className="w-full flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        {error && <p className="text-center w-full text-destructive">{error}</p>}
        {!loading && campaigns.length > 0 && (
          <div className=" flex flex-col gap-1 w-full">
            {campaigns.map((campaign) => (
              <ArticalCard
                key={campaign.id}
                campaign={campaign}
              />
            ))}
          </div>
        )}
        {!loading && campaigns.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            {t('home.noCampaigns', 'لا توجد حملات متاحة حالياً.')}
          </p>
        )}
        {totalPages > 0 && (
          <div className="w-full mt-6">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              paginationItemsToDisplay={5}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      {/* Featured Campaigns Section */}
      <div className="max-w-7xl mx-auto  mt-10">

        <h2 className="text-xl px-4 font-bold">{t('home.featuredCampaigns', 'الحملات المميزة')}</h2>
        <p className="text-muted-foreground px-4">
          {t('home.featuredCampaignsDescription', 'استعرض الحملات المميزة التي تحتاج إلى دعمك.')}
        </p>
        <FeaturedCampaigns />
      </div>
      
      <div id="campaigns-section" className="max-w-7xl  flex gap-1 flex-col items-start justify-start mx-auto p-4 mt-10">
        <h1 className="text-xl font-bold ">{t('home.allCampaigns', 'جميع الحملات')}</h1>
        <p className=" mb-4 text-muted-foreground">
          {t('home.campaignsDescription', 'استعرض الحملات المتاحة وتبرع للمساعدة في تحقيق أهدافها.')}
        </p>
        {loading && (
          <div className="w-full flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        {error && <p className="text-center w-full text-destructive">{error}</p>}
        {!loading && campaigns.length > 0 && (
          <div className=" flex flex-col gap-1 w-full">
            {campaigns.map((campaign) => (
              <ArticalCard
                key={campaign.id}
                campaign={campaign}
              />
            ))}
          </div>
        )}
        {!loading && campaigns.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            {t('home.noCampaigns', 'لا توجد حملات متاحة حالياً.')}
          </p>
        )}
        {totalPages > 0 && (
          <div className="w-full mt-6">
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              paginationItemsToDisplay={5}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
