import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { useLanguage } from '../../hooks/useLanguage';
import { adminAPI } from '../../lib/api';

const COLORS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
];

const chartConfig = {
  waterProjects: {
    label: "Water Projects",
    color: COLORS[0],
  },
  orphanEducation: {
    label: "Orphan Education", 
    color: COLORS[1],
  },
  medicalAid: {
    label: "Medical Aid",
    color: COLORS[2],
  },
  foodRelief: {
    label: "Food Relief",
    color: COLORS[3],
  },
  emergency: {
    label: "Emergency",
    color: COLORS[4],
  },
  other: {
    label: "Other",
    color: COLORS[5],
  },
};

export const CategoryDistributionChart = () => {
  const { t, formatCurrency } = useLanguage();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getCategoryDistribution();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching category distribution:', error);
      // Generate mock data for demonstration
      const mockData = [
        {
          name: t('categories.waterProjects'),
          value: 35,
          amount: 125000,
          color: COLORS[0],
        },
        {
          name: t('categories.orphanEducation'),
          value: 25,
          amount: 85000,
          color: COLORS[1],
        },
        {
          name: t('categories.medicalAid'),
          value: 20,
          amount: 95000,
          color: COLORS[2],
        },
        {
          name: t('categories.foodRelief'),
          value: 15,
          amount: 45000,
          color: COLORS[3],
        },
        {
          name: t('categories.emergency'),
          value: 5,
          amount: 25000,
          color: COLORS[4],
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {t('analytics.campaigns')}: {data.value}
          </p>
          <p className="text-sm text-gray-600">
            {t('analytics.totalAmount')}: {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-gray-600">
            {t('analytics.percentage')}: {((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]}
                  className="cursor-pointer hover:opacity-80"
                />
              ))}
            </Pie>
            <ChartTooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
      <div className="mt-2">
        <div className="grid grid-cols-1 gap-1 text-xs max-h-16 overflow-y-auto">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
              ></div>
              <span className="truncate text-xs">{item.name}</span>
              <span className="text-gray-500 ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
