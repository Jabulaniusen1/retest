'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api-client'
import { FinancialInsight, SpendingCategory } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, DollarSign, PieChart } from 'lucide-react'

export default function InsightsPage() {
  const { user } = useAuth()
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      const [insightsData, categoriesData] = await Promise.all([
        apiClient.getFinancialInsights(user.id),
        apiClient.getSpendingCategories(user.id, currentMonth)
      ])
      setInsights(insightsData)
      setSpendingCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (insightId: string) => {
    try {
      await apiClient.markInsightAsRead(insightId)
      fetchData()
    } catch (error: any) {
      console.error('Error marking insight as read:', error)
    }
  }

  const getInsightIcon = (type: string) => {
    const icons: Record<string, any> = {
      spending_pattern: TrendingUp,
      saving_opportunity: DollarSign,
      budget_alert: AlertCircle,
      investment_tip: Lightbulb,
      unusual_activity: AlertCircle
    }
    return icons[type] || Lightbulb
  }

  const getInsightColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      high: 'bg-red-500/10 text-red-500 border-red-500/20'
    }
    return colors[priority] || colors.medium
  }

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>
  }

  const totalSpent = spendingCategories?.reduce((sum, cat) => sum + cat.total_spent, 0) || 0
  const topCategory = spendingCategories?.[0]

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Financial Insights</h1>
        <p className="text-muted-foreground mt-1">AI-powered insights to help you manage your finances better</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <PieChart className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">This Month's Spending</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Top Category</span>
          </div>
          <div className="text-2xl font-bold text-foreground capitalize">
            {topCategory?.category || 'N/A'}
          </div>
          {topCategory && (
            <div className="text-sm text-muted-foreground mt-1">
              ${topCategory.total_spent.toLocaleString()} spent
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Active Insights</span>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {insights?.filter(i => !i.is_read).length || 0}
          </div>
        </Card>
      </div>

      {spendingCategories && spendingCategories.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Spending by Category</h2>
          <div className="space-y-3">
            {spendingCategories?.map((category) => {
              const percentage = (category.total_spent / totalSpent) * 100

              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground capitalize">{category.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">
                        ${category.total_spent.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {category.transaction_count} transactions
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Your Insights</h2>
        
        {!insights || insights.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No insights yet</h3>
              <p className="text-muted-foreground">Start making transactions to get personalized financial insights</p>
            </div>
          </Card>
        ) : (
          insights?.map((insight) => {
            const Icon = getInsightIcon(insight.insight_type)
            
            return (
              <Card
                key={insight.id}
                className={`p-6 border-2 transition-all ${
                  insight.is_read ? 'opacity-60' : ''
                } ${getInsightColor(insight.priority)}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    insight.priority === 'high' ? 'bg-red-500/20' :
                    insight.priority === 'medium' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{insight.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(insight.created_at).toLocaleDateString()} at {new Date(insight.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                          insight.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {insight.priority.toUpperCase()}
                        </div>
                        {!insight.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(insight.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground/80">{insight.description}</p>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
