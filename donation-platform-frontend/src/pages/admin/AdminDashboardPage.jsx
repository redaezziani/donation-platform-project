import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { UsersIcon, HeartHandshakeIcon, DollarSignIcon, TrendingUpIcon } from 'lucide-react';
import { adminAPI } from '../../lib/api';
import { ChartBarInteractive } from '../../components/charts/chart-bar-interactive';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingCampaigns: 0,
    totalRaised: 0,
    totalDonations: 0,
    averageDonation: 0,
    loading: true
  });

  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [campaignStats, donationStats, campaignsData] = await Promise.all([
        adminAPI.getCampaignStats(),
        adminAPI.getDonationStats(),
        adminAPI.getAllCampaigns(1, 10) // Get first 10 campaigns
      ]);

      setStats({
        totalUsers: 0, // We don't have user count API yet
        totalCampaigns: campaignStats.totalCampaigns,
        activeCampaigns: campaignStats.activeCampaigns,
        pendingCampaigns: campaignStats.pendingCampaigns,
        totalRaised: campaignStats.totalRaised,
        totalDonations: donationStats.totalDonations,
        averageDonation: donationStats.averageDonation,
        loading: false
      });

      // Set recent campaigns (pending ones for approval)
      const pendingCampaigns = campaignsData.items?.filter(c => c.status === 'pending') || [];
      setRecentCampaigns(pendingCampaigns.slice(0, 4));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers || "N/A",
      change: "+12%",
      increasing: true,
      icon: UsersIcon,
      iconColor: "text-blue-500 bg-blue-100"
    },
    {
      title: "إجمالي الحملات",
      value: stats.totalCampaigns,
      change: "+7%",
      increasing: true,
      icon: HeartHandshakeIcon,
      iconColor: "text-green-500 bg-green-100"
    },
    {
      title: "إجمالي التبرعات",
      value: formatCurrency(stats.totalRaised),
      change: "+18%",
      increasing: true,
      icon: DollarSignIcon,
      iconColor: "text-amber-500 bg-amber-100"
    },
    {
      title: "معدل التبرع",
      value: formatCurrency(stats.averageDonation),
      change: "+4%",
      increasing: true,
      icon: TrendingUpIcon,
      iconColor: "text-purple-500 bg-purple-100"
    }
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <div className="text-sm text-muted-foreground">
          آخر تحديث: {new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

     <ChartBarInteractive/>

      <div className="grid grid-cols-1 mt-2 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>أحدث الحملات المعلقة للموافقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.length > 0 ? (
                recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <HeartHandshakeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-sm text-muted-foreground">
                          الهدف: {formatCurrency(campaign.target_amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs bg-primary text-white rounded-md">موافقة</button>
                      <button className="px-3 py-1 text-xs bg-destructive text-white rounded-md">رفض</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد حملات بانتظار الموافقة</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <HeartHandshakeIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">الحملات النشطة</p>
                    <p className="text-sm text-muted-foreground">{stats.activeCampaigns} حملة</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <HeartHandshakeIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">بانتظار الموافقة</p>
                    <p className="text-sm text-muted-foreground">{stats.pendingCampaigns} حملة</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <DollarSignIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">إجمالي المبلغ المُجمع</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(stats.totalRaised)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;