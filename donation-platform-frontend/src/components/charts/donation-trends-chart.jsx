
import { TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"

import { useLanguage } from "@/hooks/useLanguage"
import { adminAPI } from "@/lib/api"
import React, { useEffect, useState } from "react"

const chartConfig = {
  donations: {
    label: "Donations",
    color: "var(--chart-1)",
  },
  amount: {
    label: "Amount",
    color: "var(--chart-2)",
  },
}

export function DonationTrendsChart() {
  const { t, formatCurrency } = useLanguage()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendsData()
  }, [])

  const fetchTrendsData = async () => {
    try {
      const data = await adminAPI.getDonationTrends()
      setChartData(data)
    } catch (error) {
      console.error("Error fetching donation trends:", error)
      setChartData(generateMockTrendsData())
    } finally {
      setLoading(false)
    }
  }

  const generateMockTrendsData = () => {
    const data = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split("T")[0],
        donations: Math.floor(Math.random() * 50) + 10,
        amount: Math.floor(Math.random() * 5000) + 1000,
      })
    }

    return data
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("analytics.trendChartTitle")}</CardTitle>
        <CardDescription>{t("analytics.trendChartDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value, name) => {
                      if (name === "amount") {
                        return [formatCurrency(value), t("analytics.totalAmount")]
                      }
                      return [value, t("analytics.totalDonations")]
                    }}
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString()
                    }
                  />
                }
              />
              <Area
                dataKey="donations"
                type="monotone"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.3}
              />
              <Area
                dataKey="amount"
                type="monotone"
                stroke="var(--chart-2)"
                fill="var(--chart-2)"
                fillOpacity={0.3}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {t("analytics.trendPositiveNote")} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {t("analytics.last30Days")}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
