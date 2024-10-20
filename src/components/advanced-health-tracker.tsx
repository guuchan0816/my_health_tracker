"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, Heart, Droplet, Brain, Calendar } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type SymptomRating = {
  fatigue: number
  pain: number
  headache: number
  heart: number
  stool: boolean
  period: boolean
}

type DailyData = SymptomRating & {
  date: string
  average: number
  diary: string
}

const symptomIcons = {
  fatigue: Activity,
  pain: Droplet,
  headache: Brain,
  heart: Heart,
}

export function AdvancedHealthTrackerComponent() {
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [currentRating, setCurrentRating] = useState<SymptomRating>({
    fatigue: 0,
    pain: 0,
    headache: 0,
    heart: 0,
    stool: false,
    period: false
  })
  const [currentDiary, setCurrentDiary] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [visibleSymptoms, setVisibleSymptoms] = useState({
    fatigue: true,
    pain: true,
    headache: true,
    heart: true,
    average: true
  })
  const [graphPeriod, setGraphPeriod] = useState("2weeks")

  const handleRatingChange = (symptom: keyof SymptomRating, value: number | boolean) => {
    setCurrentRating(prev => ({ ...prev, [symptom]: value }))
  }

  const handleSubmit = () => {
    const symptomValues = [currentRating.fatigue, currentRating.pain, currentRating.headache, currentRating.heart]
    const average = symptomValues.reduce((sum, value) => sum + value, 0) / symptomValues.length
    const newData: DailyData = {
      ...currentRating,
      date: currentDate,
      average: Number(average.toFixed(1)),
      diary: currentDiary
    }
    setDailyData(prev => [...prev, newData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    setCurrentRating({ fatigue: 0, pain: 0, headache: 0, heart: 0, stool: false, period: false })
    setCurrentDiary("")
    setCurrentDate(new Date().toISOString().split('T')[0])
  }

  const filteredData = useMemo(() => {
    const now = new Date()
    const periodInDays = graphPeriod === "1week" ? 7 : graphPeriod === "2weeks" ? 14 : graphPeriod === "1month" ? 30 : 365
    const startDate = new Date(now.getTime() - periodInDays * 24 * 60 * 60 * 1000)
    return dailyData.filter(data => new Date(data.date) >= startDate)
  }, [dailyData, graphPeriod])

  return (
    <div className="container mx-auto p-4 space-y-6 bg-gradient-to-br from-pink-100 to-blue-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-primary mb-8">My Health Tracker</h1>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            日々の症状記録
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(symptomIcons).map(([symptom, Icon]) => (
              <div key={symptom} className="space-y-2">
                <Label htmlFor={symptom} className="flex items-center gap-2 text-lg">
                  <Icon className="w-5 h-5 text-primary" />
                  {symptom}
                </Label>
                <Input
                  id={symptom}
                  type="range"
                  min="0"
                  max="10"
                  value={currentRating[symptom as keyof SymptomRating] as number}
                  onChange={(e) => handleRatingChange(symptom as keyof SymptomRating, parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm font-medium text-primary">
                  {currentRating[symptom as keyof SymptomRating]}
                </span>
              </div>
            ))}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-lg">
                <span className="text-2xl">💩</span>排便
              </Label>
              <input
                type="checkbox"
                checked={currentRating.stool}
                onChange={(e) => handleRatingChange('stool', e.target.checked)}
                className="w-6 h-6"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-lg">
                <span className="text-2xl">🩸</span>生理
              </Label>
              <input
                type="checkbox"
                checked={currentRating.period}
                onChange={(e) => handleRatingChange('period', e.target.checked)}
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Label htmlFor="diary" className="text-lg">一言日記</Label>
            <Textarea
              id="diary"
              value={currentDiary}
              onChange={(e) => setCurrentDiary(e.target.value)}
              placeholder="今日の出来事や気分を一言で..."
              className="w-full"
            />
          </div>
          <Input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="mt-6"
          />
          <Button onClick={handleSubmit} className="mt-4 w-full">記録する</Button>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">症状グラフ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Label>表示期間:</Label>
              <Select value={graphPeriod} onValueChange={setGraphPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="期間を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1week">1週間</SelectItem>
                  <SelectItem value="2weeks">2週間</SelectItem>
                  <SelectItem value="1month">1ヶ月</SelectItem>
                  <SelectItem value="1year">1年</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {Object.entries(visibleSymptoms).map(([symptom, isVisible]) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  id={`show-${symptom}`}
                  checked={isVisible}
                  onCheckedChange={(checked) => 
                    setVisibleSymptoms(prev => ({ ...prev, [symptom]: checked === true }))
                  }
                />
                <Label htmlFor={`show-${symptom}`}>{symptom}</Label>
              </div>
            ))}
          </div>
          <ChartContainer
            config={{
              fatigue: { label: "倦怠感", color: "hsl(var(--chart-1))" },
              pain: { label: "痛み", color: "hsl(var(--chart-2))" },
              headache: { label: "頭痛", color: "hsl(var(--chart-3))" },
              heart: { label: "心", color: "hsl(var(--chart-4))" },
              average: { label: "平均", color: "hsl(var(--chart-5))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {visibleSymptoms.fatigue && <Line type="monotone" dataKey="fatigue" stroke="var(--color-fatigue)" />}
                {visibleSymptoms.pain && <Line type="monotone" dataKey="pain" stroke="var(--color-pain)" />}
                {visibleSymptoms.headache && <Line type="monotone" dataKey="headache" stroke="var(--color-headache)" />}
                {visibleSymptoms.heart && <Line type="monotone" dataKey="heart" stroke="var(--color-heart)" />}
                {visibleSymptoms.average && <Line type="monotone" dataKey="average" stroke="var(--color-average)" strokeWidth={2} />}
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            カレンダー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={() => setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1))}>
              前月
            </Button>
            <h2 className="text-xl font-bold text-primary">{currentMonth.toLocaleString('ja-JP', { year: 'numeric', month: 'long' })}</h2>
            <Button onClick={() => setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1))}>
              翌月
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-2">※ 丸い数字は症状の平均点（0-10）を表します。絵文字は排便と生理の記録を示します。日付にカーソルを合わせると一言日記が表示されます。</p>
          <div className="grid grid-cols-7 gap-2">
            {['日', '月', '火', '水', '木', '金', '土'].map(day => (
              <div key={day} className="text-center font-bold text-primary">{day}</div>
            ))}
            {Array.from({ length: 42 }, (_, i) => {
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1 - currentMonth.getDay() + i)
              const dateString = date.toISOString().split('T')[0]
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
              const dayData = dailyData.find(d => d.date === dateString)
              return (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`p-2 border rounded-lg text-center ${isCurrentMonth ? 'bg-white/50' : 'bg-gray-100/50 text-gray-400'}`}>
                        <div className="font-medium">{date.getDate()}</div>
                        {dayData && (
                          <div className="mt-1 text-xs font-medium flex items-center justify-center space-x-1">
                            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center" style={{backgroundColor: `hsl(${dayData.average * 36}, 100%, 50%)`}}>
                              {dayData.average}
                            </span>
                            {dayData.stool && <span className="text-lg">💩</span>}
                            {dayData.period && <span className="text-lg">🩸</span>}
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {dayData ? dayData.diary || "日記なし" : "データなし"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}