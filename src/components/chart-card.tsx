import { memo, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts"

const SELECTED_COLOR = "#10b981"

interface ChartCardProps {
  title: string
  description: string
  data: Array<{ name: string; value: number }>
  chartType: string
  colors: string[]
  isHovered: boolean
  onHover: (chartType: string, index: number, segment: any, percentage: number) => void
  onLeave: () => void
}

const arePropsEqual = (prevProps: ChartCardProps, nextProps: ChartCardProps) => {
  const dataEqual =
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data) &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.chartType === nextProps.chartType

  return dataEqual
}

export const ChartCard = memo(function ChartCard({
  title,
  description,
  data,
  chartType,
  colors,
  isHovered,
  onHover,
  onLeave,
}: ChartCardProps) {
  const [localActiveIndex, setLocalActiveIndex] = useState<number | null>(null)

  const chartData = useMemo(() => Object.freeze(data), [data])
  const chartColors = useMemo(() => Object.freeze(colors), [colors])

  const renderActiveShape = useCallback((props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, payload, percent, value } = props

    return (
      <g>
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#6b7280" className="text-sm">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#1f2937" className="text-xl font-bold">
          {typeof value === "number" && value > 1000 ? `$${value.toLocaleString()}` : value}
        </text>

        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 15}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={SELECTED_COLOR}
          style={{
            filter: "drop-shadow(0 15px 30px rgba(16,185,129,0.5)) drop-shadow(0 5px 10px rgba(16,185,129,0.3))",
          }}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 16}
          outerRadius={outerRadius + 22}
          fill={SELECTED_COLOR}
          opacity={0.4}
          style={{
            filter: "blur(4px)",
          }}
        />
      </g>
    )
  }, [])

  const handlePieEnter = useCallback(
    (_: any, index: number) => {
      setLocalActiveIndex(index)
      const segment = chartData[index]
      const total = chartData.reduce((sum, item) => sum + item.value, 0)
      const percentage = (segment.value / total) * 100
      onHover(chartType, index, segment, percentage)
    },
    [chartData, chartType, onHover],
  )

  const handlePieLeave = useCallback(() => {
    onLeave()
  }, [onLeave])

  return (
    <Card
      className="hover:shadow-2xl transition-shadow duration-300 cursor-pointer border-2 border-border hover:border-gold/30 data-[hovered=true]:border-gold data-[hovered=true]:shadow-2xl"
      data-hovered={isHovered}
    >
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300} debounce={150}>
          <PieChart>
            <Pie
              activeIndex={isHovered ? (localActiveIndex ?? undefined) : undefined}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              onMouseEnter={handlePieEnter}
              onMouseLeave={handlePieLeave}
              isAnimationActive={false}
              animationDuration={0}
              label={({ cx, cy, midAngle, outerRadius, percent, index: idx }) => {
                const RADIAN = Math.PI / 180
                const radius = outerRadius + 30
                const x = cx + radius * Math.cos(-midAngle * RADIAN)
                const y = cy + radius * Math.sin(-midAngle * RADIAN)

                return (
                  <text
                    x={x}
                    y={y}
                    fill={chartColors[idx % chartColors.length]}
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    className="text-sm font-semibold"
                  >
                    {`${(percent * 100).toFixed(1)}%`}
                  </text>
                )
              }}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${chartType}-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}, arePropsEqual)

ChartCard.displayName = "ChartCard"
