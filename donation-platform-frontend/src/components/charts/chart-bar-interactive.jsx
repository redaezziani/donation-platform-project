"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import { analyticsAPI } from "../../lib/api"

export const description = "Weekly donation platform overview chart"

const chartConfig = {
  donations: {
    label: "التبرعات (ر.س)",
    color: "#3b82f6",
  },
  users: {
    label: "المستخدمون الجدد",
    color: "#22c55e", // Lighter green color
  },
} 

export function ChartBarInteractive() {
  const [chartData, setChartData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await analyticsAPI.getWeeklyAnalytics(16)
      
      // Transform the data to match the chart format
      const transformedData = data.weekly_stats.map(stat => ({
        period: stat.period,
        donations: Number(stat.donations) || 0,
        users: Number(stat.donors) || 0, // Using donors as users for now
      }))
      
      console.log('Chart data:', transformedData)
      setChartData(transformedData)
    } catch (err) {
      console.error('Error fetching analytics data:', err)
      setError('حدث خطأ أثناء جلب البيانات التحليلية')
      
      // Fallback to sample data for testing
      const fallbackData = [
        { period: "2025-05-01", donations: 15420, users: 45 },
        { period: "2025-05-08", donations: 22350, users: 67 },
        { period: "2025-05-15", donations: 18750, users: 52 },
        { period: "2025-05-22", donations: 31200, users: 89 },
        { period: "2025-05-29", donations: 28900, users: 76 },
        { period: "2025-06-05", donations: 34500, users: 95 },
        { period: "2025-06-12", donations: 26800, users: 63 },
        { period: "2025-06-19", donations: 39250, users: 108 },
        { period: "2025-06-26", donations: 42100, users: 125 },
        { period: "2025-07-03", donations: 35600, users: 87 },
        { period: "2025-07-10", donations: 48300, users: 142 },
        { period: "2025-07-17", donations: 41750, users: 115 },
        { period: "2025-07-24", donations: 52900, users: 156 },
        { period: "2025-07-31", donations: 46200, users: 134 },
        { period: "2025-08-07", donations: 58400, users: 178 },
        { period: "2025-08-14", donations: 51650, users: 149 },
      ]
      console.log('Using fallback data:', fallbackData)
      setChartData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const total = React.useMemo(
    () => ({
      donations: chartData.reduce((acc, curr) => acc + curr.donations, 0),
      users: chartData.reduce((acc, curr) => acc + curr.users, 0),
    }),
    [chartData]
  )

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="py-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">جاري تحميل البيانات التحليلية...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-1 sm:!py-0">
          <CardTitle>نظرة عامة أسبوعية - منصة التبرعات</CardTitle>
          <CardDescription>
            عرض إحصائيات التبرعات والمستخدمين لآخر 16 أسبوع
            {error && (
              <span className="text-destructive block">
                {error} (يتم عرض بيانات تجريبية)
              </span>
            )}
          </CardDescription>
        </div>
        <div className="flex">
          {["donations", "users"].map((key) => {
            return (
              <div
                key={key}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {key === 'donations' 
                    ? formatCurrency(total[key])
                    : total[key].toLocaleString('ar-SA')
                  }
                </span>
              </div>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-1.5 "
              style={{ backgroundColor: chartConfig.donations.color }}
            />
            <span className="text-sm text-muted-foreground">
              {chartConfig.donations.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-1.5 "
              style={{ backgroundColor: chartConfig.users.color }}
            />
            <span className="text-sm text-muted-foreground">
              {chartConfig.users.label}
            </span>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("ar-SA", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis 
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return new Intl.NumberFormat('ar-SA', {
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(value)
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[220px]"
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    const endDate = new Date(date)
                    endDate.setDate(date.getDate() + 6)
                    
                    return `الأسبوع: ${date.toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                    })} - ${endDate.toLocaleDateString("ar-SA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  }}
                  formatter={(value, name) => {
                    if (name === 'donations') {
                      return [formatCurrency(value), 'إجمالي التبرعات']
                    }
                    if (name === 'users') {
                      return [value, 'المستخدمون الجدد']
                    }
                    return [value, name]
                  }}
                />
              }
            />
            <Area 
              yAxisId="left"
              type="liner"
              dataKey="donations" 
              stroke={chartConfig.donations.color}
              fill={chartConfig.donations.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area 
              yAxisId="right"
              type="liner"
              dataKey="users" 
              stroke={chartConfig.users.color}
              fill={chartConfig.users.color}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
