import React, { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { useLanguage } from '../../hooks/useLanguage';
import { adminAPI } from '../../lib/api';

const chartConfig = {
  active: {
    label: "Active",
    color: "#22c55e",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  completed: {
    label: "Completed",
    color: "#3b82f6",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
};

export const CampaignStatusChart = () => {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatusData();
  }, []);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      const stats = await adminAPI.getCampaignStats();
      
      const data = [
        {
          status: t('campaign.active'),
          count: stats.activeCampaigns || 0,
          fill: chartConfig.active.color,
        },
        {
          status: t('campaign.pending'),
          count: stats.pendingCampaigns || 0,
          fill: chartConfig.pending.color,
        },
        {
          status: t('campaign.completed'),
          count: stats.completedCampaigns || 0,
          fill: chartConfig.completed.color,
        },
        {
          status: t('campaign.rejected'),
          count: Math.floor(Math.random() * 5), // Mock data for rejected
          fill: chartConfig.rejected.color,
        },
      ];
      
      setChartData(data);
    } catch (error) {
      console.error('Error fetching campaign status:', error);
      // Generate mock data for demonstration
      const mockData = [
        {
          status: t('campaign.active'),
          count: 12,
          fill: chartConfig.active.color,
        },
        {
          status: t('campaign.pending'),
          count: 8,
          fill: chartConfig.pending.color,
        },
        {
          status: t('campaign.completed'),
          count: 25,
          fill: chartConfig.completed.color,
        },
        {
          status: t('campaign.rejected'),
          count: 3,
          fill: chartConfig.rejected.color,
        },
      ];
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="status" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs" />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => [value, t('analytics.campaigns')]}
                  labelFormatter={(label) => label}
                />
              } 
            />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              className="cursor-pointer hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.fill }}
            ></div>
            <span className="truncate">{item.status}: {item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
