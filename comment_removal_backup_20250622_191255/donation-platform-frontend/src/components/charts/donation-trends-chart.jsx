
"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"

import { useLanguage } from "../../hooks/useLanguage"

export function DonationTrendsChart({ data }) {
  const { t, formatCurrency } = useLanguage()

  // Create dynamic chart config with translations
  const chartConfig = React.useMemo(() => ({
    donations: {
      label: t('charts.labels.donations'),
      color: "hsl(var(--chart-1))",
    },
    amount: {
      label: t('charts.labels.amount'),
      color: "hsl(var(--chart-2))",
    },
  }), [t])

  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    
    return data.map(item => ({
      date: item.day || item.date,
      donations: item.donations || 0,
      amount: item.amount || 0
    }))
  }, [data])

  if (!chartData.length) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">{t('charts.noDonationDataAvailable')}</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="amount"
          type="natural"
          fill="var(--color-amount)"
          fillOpacity={0.4}
          stroke="var(--color-amount)"
          stackId="a"
        />
        <Area
          dataKey="donations"
          type="natural"
          fill="var(--color-donations)"
          fillOpacity={0.4}
          stroke="var(--color-donations)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  )
}
