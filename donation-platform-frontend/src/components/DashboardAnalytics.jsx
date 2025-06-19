import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUpIcon, BarChart3Icon, PieChartIcon } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { adminAPI } from '../lib/api';
import { DonationTrendsChart } from './charts/donation-trends-chart';
import { CampaignStatusChart } from './charts/campaign-status-chart';
import { CategoryDistributionChart } from './charts/category-distribution-chart';

const DashboardAnalytics = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading time for now
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-3">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p>{t('analytics.errorLoading')}</p>
              <button 
                onClick={() => window.location.reload()} 
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Donation Trends Chart */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUpIcon className="h-5 w-5 text-blue-500" />
            {t('analytics.donationTrends')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DonationTrendsChart />
        </CardContent>
      </Card>

      {/* Campaign Status Chart */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3Icon className="h-5 w-5 text-green-500" />
            {t('analytics.campaignStatus')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignStatusChart />
        </CardContent>
      </Card>

      {/* Category Distribution Chart */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChartIcon className="h-5 w-5 text-purple-500" />
            {t('analytics.categoryDistribution')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryDistributionChart />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
