import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  Search 
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import PaginationComponent from '../../components/PaginationComponent';
import StatsCards from '../../components/admin/campaigns/stats-cards';
import CampaignsTable from '../../components/admin/campaigns/campaigns-table';
import { adminAPI } from '../../lib/api';
import { useLanguage } from '../../hooks/useLanguage';
import CreateCampaignSheet from '../../components/create-campaign';

const AdminCampaignsPage = () => {
  const { t } = useLanguage();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    pendingCampaigns: 0,
    totalRaised: 0,
    totalDonors: 0
  });

  
  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [currentPage, statusFilter, languageFilter]);

  useEffect(() => {
    // Reset to first page when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchCampaigns();
    }
  }, [searchTerm, statusFilter, languageFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllCampaigns(currentPage, 10, statusFilter, languageFilter);
      setCampaigns(response.items || []);
      setTotalPages(response.pagination?.total_pages || 1);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(t('common.errorLoadingData', 'حدث خطأ أثناء جلب البيانات'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const campaignStats = await adminAPI.getCampaignStats();
      setStats({
        activeCampaigns: campaignStats.activeCampaigns,
        pendingCampaigns: campaignStats.pendingCampaigns,
        totalRaised: campaignStats.totalRaised,
        totalDonors: 0 // We don't have this data yet
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      if (action === 'approve') {
        await adminAPI.updateCampaignStatus(campaignId, 'active');
      } else if (action === 'reject') {
        await adminAPI.updateCampaignStatus(campaignId, 'cancelled');
      }
      
      // Refresh the campaigns list
      fetchCampaigns();
      fetchStats();
    } catch (err) {
      console.error(`Error ${action}ing campaign:`, err);
      const actionText = action === 'approve' 
        ? t('admin.approve', 'الموافقة على') 
        : t('admin.reject', 'رفض');
      alert(`${t('common.error', 'حدث خطأ أثناء')} ${actionText} ${t('campaign.entity', 'الحملة')}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('campaign.loading', 'جاري تحميل الحملات...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('admin.campaignManagement', 'إدارة الحملات')}</h1>
        <CreateCampaignSheet/>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Statistics Cards */}
      <StatsCards stats={stats} formatCurrency={formatCurrency} />
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <Input
            placeholder={t('campaign.searchPlaceholder', 'بحث عن حملة...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            prefix={<Search className="h-4 w-4 ml-2 text-muted-foreground" />}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-1/3 md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('campaign.status.label', 'الحالة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allStatuses', 'كل الحالات')}</SelectItem>
                <SelectItem value="active">{t('campaign.status.active', 'نشطة')}</SelectItem>
                <SelectItem value="pending">{t('campaign.status.pending', 'قيد المراجعة')}</SelectItem>
                <SelectItem value="draft">{t('campaign.status.draft', 'مسودة')}</SelectItem>
                <SelectItem value="completed">{t('campaign.status.completed', 'مكتملة')}</SelectItem>
                <SelectItem value="cancelled">{t('campaign.status.cancelled', 'ملغية')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/3 md:w-auto">
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t('campaign.language', 'اللغة')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.allLanguages', 'كل اللغات')}</SelectItem>
                <SelectItem value="ar">{t('language.arabic', 'العربية')}</SelectItem>
                <SelectItem value="en">{t('language.english', 'English')}</SelectItem>
                <SelectItem value="fr">{t('language.french', 'Français')}</SelectItem>
                <SelectItem value="es">{t('language.spanish', 'Español')}</SelectItem>
                <SelectItem value="ru">{t('language.russian', 'Русский')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Campaigns Table */}
      <CampaignsTable 
        campaigns={campaigns}
        loading={loading}
        searchTerm={searchTerm}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        handleCampaignAction={handleCampaignAction}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-end">
          <PaginationComponent 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminCampaignsPage;