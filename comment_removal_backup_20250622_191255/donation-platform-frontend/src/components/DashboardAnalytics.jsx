import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { TrendingUpIcon, BarChart3Icon, PieChartIcon, TrendingUp, UsersIcon, DollarSignIcon, TargetIcon } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { analyticsAPI } from '../lib/api';
import { DonationTrendsChart } from './charts/donation-trends-chart';
import { CampaignStatusChart } from './charts/campaign-status-chart';
import { CategoryDistributionChart } from './charts/category-distribution-chart';

const DashboardAnalytics = () => {
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsAPI.getComprehensiveAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Overview Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                  <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-3">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>{t('analytics.errorLoading')}</p>
              <button 
                onClick={fetchAnalyticsData} 
                className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                {t('common.retry')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overview = analyticsData?.overview || {};
  const campaigns = overview.campaigns || {};
  const donations = overview.donations || {};
  const users = overview.users || {};
  const newsletter = overview.newsletter || {};

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalCampaigns')}</CardTitle>
            <TargetIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.active || 0} {t('analytics.active')}, {campaigns.completed || 0} {t('analytics.completed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalDonations')}</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(donations.total_amount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.fromDonations', { count: donations.total_count || 0 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalUsers')}</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.registeredUsers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.newsletterSubscribers')}</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsletter.active_subscribers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.activeSubscribers')}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donation Trends Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              {t('analytics.donationTrends')}
            </CardTitle>
            <CardDescription>
              {t('analytics.donationTrendsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DonationTrendsChart data={analyticsData?.donation_trends} />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {t('analytics.recentDonationActivity')} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {t('analytics.dailyDonationAmounts')}
            </div>
          </CardFooter>
        </Card>

        {/* Campaign Status Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              {t('analytics.campaignStatus')}
            </CardTitle>
            <CardDescription>
              {t('analytics.campaignStatusDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignStatusChart data={analyticsData?.campaign_status} />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {t('analytics.campaignActivityOverview')}
            </div>
            <div className="leading-none text-muted-foreground">
              {t('analytics.currentStatusCampaigns')}
            </div>
          </CardFooter>
        </Card>

        {/* Category Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              {t('analytics.categoryDistribution')}
            </CardTitle>
            <CardDescription>
              {t('analytics.categoryDistributionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <CategoryDistributionChart data={analyticsData?.category_distribution} />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {t('analytics.popularCampaignCategories')}
            </div>
            <div className="leading-none text-muted-foreground">
              {t('analytics.basedOnCampaignCount')}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default DashboardAnalytics;
