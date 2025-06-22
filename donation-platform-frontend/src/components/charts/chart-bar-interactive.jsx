"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
import { useLanguage } from "../../hooks/useLanguage"

export const description = "Weekly donation platform overview chart"

export function ChartBarInteractive() {
  const { t, formatCurrency } = useLanguage()
  const [chartData, setChartData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  // Create dynamic chart config with translations
  const chartConfig = React.useMemo(() => ({
    donations: {
      label: t('charts.weeklyOverview.donationsLabel'),
      color: "hsl(var(--chart-1))",
    },
    users: {
      label: t('charts.weeklyOverview.usersLabel'),
      color: "hsl(var(--chart-2))",
    },
  }), [t])

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
      setError(t('charts.weeklyOverview.dataFetchError'))
      
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

  const formatCurrencySAR = (value) => {
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
            <div className="flex aspect-video animate-pulse rounded-md bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-1 sm:!py-0">
          <CardTitle>{t('charts.weeklyOverview.title')}</CardTitle>
          <CardDescription>
            {error ? t('charts.weeklyOverview.descriptionWithError') : t('charts.weeklyOverview.description')}
            {error && (
              <span className="text-destructive block">
                {error}
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
                    : total[key].toLocaleString()
                  }
                </span>
              </div>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
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
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[220px]"
                  labelFormatter={(value) => {
                    const date = new Date(value)
                    const endDate = new Date(date)
                    endDate.setDate(date.getDate() + 6)
                    
                    return `${t('charts.weeklyOverview.weekLabel')}: ${date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })} - ${endDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`
                  }}
                  formatter={(value, name) => {
                    if (name === 'donations') {
                      return [formatCurrency(value), t('charts.weeklyOverview.totalDonations')]
                    }
                    if (name === 'users') {
                      return [value, t('charts.weeklyOverview.newUsers')]
                    }
                    return [value, name]
                  }}
                />
              }
            />
            <Area
              dataKey="donations"
              type="natural"
              fill="var(--color-donations)"
              fillOpacity={0.4}
              stroke="var(--color-donations)"
              stackId="a"
            />
            <Area
              dataKey="users"
              type="natural"
              fill="var(--color-users)"
              fillOpacity={0.4}
              stroke="var(--color-users)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
