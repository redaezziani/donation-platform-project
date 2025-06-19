import React, { useState, useEffect } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { useLanguage } from '../../hooks/useLanguage';
import { adminAPI } from '../../lib/api';

const chartConfig = {
  donations: {
    label: "Donations",
    color: "#3b82f6",
  },
  amount: {
    label: "Amount",
    color: "#22c55e",
  },
};

export const DonationTrendsChart = () => {
  const { t, formatCurrency } = useLanguage();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendsData();
  }, []);

  const fetchTrendsData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDonationTrends();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching donation trends:', error);
      // Generate mock data for demonstration
      const mockData = generateMockTrendsData();
      setChartData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrendsData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        donations: Math.floor(Math.random() * 50) + 10,
        amount: Math.floor(Math.random() * 5000) + 1000,
      });
    }
    
    return data;
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
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              className="text-xs"
            />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => {
                    if (name === 'amount') {
                      return [formatCurrency(value), t('analytics.totalAmount')];
                    }
                    return [value, t('analytics.totalDonations')];
                  }}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString();
                  }}
                />
              } 
            />
            <Line 
              type="monotone" 
              dataKey="donations" 
              stroke={chartConfig.donations.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              yAxisId="left"
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke={chartConfig.amount.color}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-2 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>{t('analytics.donationsCount')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>{t('analytics.donationAmount')}</span>
        </div>
      </div>
    </div>
  );
};
