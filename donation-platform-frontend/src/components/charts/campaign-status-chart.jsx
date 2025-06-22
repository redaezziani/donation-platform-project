"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import { useLanguage } from "../../hooks/useLanguage"

export const CampaignStatusChart = ({ data }) => {
  const { t } = useLanguage()

  const chartConfig = {
    active: {
      label: t('campaign.active'),
      color: "hsl(var(--chart-1))",
    },
    pending: {
      label: t('campaign.pending'), 
      color: "hsl(var(--chart-2))",
    },
    completed: {
      label: t('campaign.completed'),
      color: "hsl(var(--chart-3))",
    },
    draft: {
      label: t('campaign.draft'),
      color: "hsl(var(--chart-4))",
    },
    cancelled: {
      label: t('campaign.cancelled'),
      color: "hsl(var(--chart-5))",
    },
  }

  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    
    return data.map(item => ({
      status: item.label || item.status,
      count: item.count || 0,
      fill: item.fill || "hsl(var(--chart-1))",
    }))
  }, [data])

  if (!chartData.length) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">{t('charts.noDataAvailable')}</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="status"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 10)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="count" strokeWidth={2} radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
