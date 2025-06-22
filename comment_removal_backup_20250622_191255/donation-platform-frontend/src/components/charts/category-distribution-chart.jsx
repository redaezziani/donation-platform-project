"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart"
import { useLanguage } from "../../hooks/useLanguage"

export const CategoryDistributionChart = ({ data }) => {
  const { t, formatCurrency } = useLanguage()

  // Create dynamic chart config with translations
  const chartConfig = React.useMemo(() => ({
    campaigns: {
      label: t('charts.labels.campaigns'),
    },
  }), [t])

  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    
    return data.map(item => ({
      category: item.category || item.name,
      campaigns: item.count || item.value || 0,
      fill: item.fill || item.color || "hsl(var(--chart-1))",
    }))
  }, [data])

  const totalCampaigns = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.campaigns, 0)
  }, [chartData])

  if (!chartData.length) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">{t('charts.noCategoryDataAvailable')}</p>
      </div>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="campaigns"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalCampaigns.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      {t('charts.campaigns')}
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
